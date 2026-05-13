import { createClientDB, deleteClientDB, getClientDBs, updateClientDB } from "@/api/clientdb"
import { type ClientDB, type ClientDBCreate } from "@/types/compliance"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"

export interface EditableClientDB extends ClientDB {
  isEditing?: boolean
  isNew?: boolean
  isDeleted?: boolean
  hasLocalChanges?: boolean
}

export interface UseClientDBsResult {
  rows: EditableClientDB[]
  isLoading: boolean
  hasChanges: boolean
  isPending: boolean
  addNewDB: () => void
  startEditing: (id: number) => void
  saveEdit: (id: number) => void
  cancelEdit: (id: number) => void
  updateField: (id: number, field: keyof ClientDBCreate, value: string) => void
  removeDB: (id: number) => void
  restoreDB: (id: number) => void
  applyChanges: () => Promise<void>
  resetState: () => void
}

export const useClientDBs = (): UseClientDBsResult => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["clientdbs"],
    queryFn: () => getClientDBs(),
  })

  const [created, setCreated] = useState<EditableClientDB[]>([])
  const [edited, setEdited] = useState<Record<number, ClientDB>>({})
  const [editing, setEditing] = useState<Record<number, boolean>>({})
  const [deleted, setDeleted] = useState<Set<number>>(new Set())

  const createMutation = useMutation({ mutationFn: createClientDB })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientDBCreate }) => updateClientDB(id, data),
  })

  const deleteMutation = useMutation({ mutationFn: deleteClientDB })

  const existingRows = useMemo(() => {
    if (!data) return []

    return data.results.map((db) => ({
      ...db,
      ...edited[db.id], // Overlay draft edits on top of server state without modifying original cache
      isEditing: editing[db.id] ?? false, // Attach UI metadata
      isNew: false,
      isDeleted: deleted.has(db.id),
      hasLocalChanges: Boolean(edited[db.id]) || deleted.has(db.id),
    }))
  }, [data, deleted, edited, editing])

  const rows = useMemo(() => [...existingRows, ...created], [created, existingRows])

  const hasChanges = useMemo(
    () => created.length > 0 || Object.keys(edited).length > 0 || deleted.size > 0,
    [created.length, edited, deleted.size],
  )

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const addNewDB = () => {
    const newDB: EditableClientDB = {
      id: -Date.now(), // Negative IDs to avoid collision with backend IDs
      name: "",
      connection_string: "",
      isEditing: true,
      isNew: true,
      hasLocalChanges: true,
    }

    setCreated((prev) => [...prev, newDB])
  }

  const startEditing = (id: number) => {
    const isNewRow = created.some((db) => db.id === id)

    if (isNewRow) {
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, isEditing: true } : db)))
      return
    }

    setEditing((prev) => ({ ...prev, [id]: true }))
  }

  const saveEdit = (id: number) => {
    const isNewRow = created.some((db) => db.id === id)

    if (isNewRow) {
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, isEditing: false } : db)))
      return
    }

    setEditing((prev) => ({ ...prev, [id]: false }))
  }

  const cancelEdit = (id: number) => {
    const newIndex = created.findIndex((db) => db.id === id)

    if (newIndex !== -1) {
      setCreated((prev) => prev.filter((db) => db.id !== id))
      return
    }

    setEditing((prev) => ({ ...prev, [id]: false }))
    setEdited((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updateField = (id: number, field: keyof ClientDBCreate, value: string) => {
    const isNewRow = created.some((db) => db.id === id)

    if (isNewRow) {
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, [field]: value } : db)))
      return
    }

    const original = data?.results.find((db) => db.id === id)
    if (!original) return

    // Build a full updated object
    const nextValue = {
      ...original,
      ...(edited[id] ?? {}),
      [field]: value,
    }

    setEdited((prev) => ({ ...prev, [id]: nextValue }))
    setEditing((prev) => ({ ...prev, [id]: true }))
  }

  const removeDB = (id: number) => {
    const isNewRow = created.some((db) => db.id === id)

    if (isNewRow) {
      setCreated((prev) => prev.filter((db) => db.id !== id))
      return
    }

    setDeleted((prev) => new Set(prev).add(id))
    setEditing((prev) => ({ ...prev, [id]: false }))
    setEdited((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const restoreDB = (id: number) => {
    setDeleted((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const resetState = () => {
    setCreated([])
    setEdited({})
    setEditing({})
    setDeleted(new Set())
  }

  const applyChanges = async () => {
    const createOps = created.map((db) =>
      createMutation.mutateAsync({ name: db.name, connection_string: db.connection_string }),
    )
    const updateOps = Object.entries(edited).map(([id, fields]) =>
      updateMutation.mutateAsync({ id: Number(id), data: fields }),
    )
    const deleteOps = Array.from(deleted).map((id) => deleteMutation.mutateAsync(id))

    // Wait for all mutations to complete before proceeding
    await Promise.all([...createOps, ...updateOps, ...deleteOps])

    // After all mutations succeed, refetch the list to get the latest server state
    await queryClient.invalidateQueries({
      queryKey: ["clientdbs"],
    })

    resetState()
  }

  return {
    rows,
    isLoading,
    hasChanges,
    isPending,
    addNewDB,
    startEditing,
    saveEdit,
    cancelEdit,
    updateField,
    removeDB,
    restoreDB,
    applyChanges,
    resetState,
  }
}
