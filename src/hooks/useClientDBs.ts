import { createClientDB, deleteClientDB, getClientDBs, updateClientDB } from "@/api/clientdb"
import { type ClientDB, type ClientDBCreate } from "@/types/compliance"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

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
  revertRow: (id: number) => void
  cancelEdit: (id: number) => void
  updateField: (id: number, field: keyof ClientDBCreate, value: string) => void
  removeDB: (id: number) => void
  restoreDB: (id: number) => void
  applyChanges: () => Promise<void>
  resetState: () => void
  page: number
  totalPages: number
  totalCount: number
  hasNext: boolean
  hasPrevious: boolean
  setPage: (page: number) => void
}

export const useClientDBs = (): UseClientDBsResult => {
  const PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["clientdbs", page],
    queryFn: () => getClientDBs({ page }),
  })

  // Local state tracks all changes before they're applied to server
  const [created, setCreated] = useState<EditableClientDB[]>([]) // New rows not yet on server
  const [edited, setEdited] = useState<Record<number, ClientDB>>({}) // id -> modified fields
  const [editing, setEditing] = useState<Record<number, boolean>>({}) // Which rows are in edit mode
  const [deleted, setDeleted] = useState<Set<number>>(new Set()) // IDs marked for deletion
  const [snapshots, setSnapshots] = useState<Record<number, ClientDB | undefined>>({}) // Pre-edit state for undo/cancel

  const createMutation = useMutation({ mutationFn: createClientDB })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientDBCreate }) => updateClientDB(id, data),
  })

  const deleteMutation = useMutation({ mutationFn: deleteClientDB })

  // Helper to check if a row was created locally (not yet on server)
  const isNewRow = (id: number) => created.some((db) => db.id === id)

  // Restore a row's snapshot (previous edits or clean state) and return whether a snapshot existed
  const restoreSnapshot = (id: number): boolean => {
    const snapshot = snapshots[id]
    if (!(id in snapshots)) return false

    if (snapshot) {
      setEdited((prev) => ({ ...prev, [id]: snapshot }))
    } else {
      setEdited((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    return true
  }

  // Clear snapshot for an ID
  const clearSnapshot = (id: number) => {
    setSnapshots((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  // Merge server data with local edits and UI state flags
  const existingRows = data
    ? data.results.map((db) => ({
        ...db,
        ...edited[db.id], // Overlay draft edits on top of server state without modifying original cache
        isEditing: editing[db.id] ?? false, // Attach UI metadata
        isNew: false,
        isDeleted: deleted.has(db.id),
        hasLocalChanges: Boolean(edited[db.id]) || deleted.has(db.id),
      }))
    : []

  // New rows appended at the end
  const rows = [...existingRows, ...created]
  const hasChanges = created.length > 0 || Object.keys(edited).length > 0 || deleted.size > 0

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
    if (isNewRow(id)) {
      // Save current state before editing, for cancel to restore
      const current = created.find((db) => db.id === id)
      if (current) setSnapshots((prev) => ({ ...prev, [id]: { ...current } }))
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, isEditing: true } : db)))
      return
    }

    // Save current edited state (or undefined if clean) as snapshot for cancel
    setSnapshots((prev) => ({ ...prev, [id]: edited[id] }))
    setEditing((prev) => ({ ...prev, [id]: true }))
  }

  const saveEdit = (id: number) => {
    if (isNewRow(id)) {
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, isEditing: false } : db)))
    } else {
      setEditing((prev) => ({ ...prev, [id]: false }))
    }

    // Clear snapshot since changes are now "committed" locally
    clearSnapshot(id)
  }

  const revertRow = (id: number) => {
    // Discard all local changes for this row
    setEditing((prev) => ({ ...prev, [id]: false }))
    setEdited((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    clearSnapshot(id)
  }

  const cancelEdit = (id: number) => {
    if (isNewRow(id)) {
      const snapshot = snapshots[id]

      // If we have a snapshot, it means this row was previously saved as draft, so restore it
      // If no snapshot, it was never saved, so just remove it entirely
      if (id in snapshots && snapshot) {
        setCreated((prev) =>
          prev.map((db) => (db.id === id ? { ...db, ...snapshot, isEditing: false } : db)),
        )
      } else {
        setCreated((prev) => prev.filter((db) => db.id !== id))
      }
    } else {
      setEditing((prev) => ({ ...prev, [id]: false }))
      restoreSnapshot(id)
    }

    clearSnapshot(id)
  }

  const updateField = (id: number, field: keyof ClientDBCreate, value: string) => {
    if (isNewRow(id)) {
      setCreated((prev) => prev.map((db) => (db.id === id ? { ...db, [field]: value } : db)))
      return
    }

    // For existing rows, build complete object: server data + previous edits + new change
    const original = data?.results.find((db) => db.id === id)
    if (!original) return

    const nextValue = {
      ...original,
      ...(edited[id] ?? {}),
      [field]: value,
    }

    setEdited((prev) => ({ ...prev, [id]: nextValue }))
    setEditing((prev) => ({ ...prev, [id]: true }))
  }

  const removeDB = (id: number) => {
    if (isNewRow(id)) {
      // Unsaved rows just get removed from local state
      setCreated((prev) => prev.filter((db) => db.id !== id))
      return
    }

    // Mark for deletion, clear any pending edits
    setDeleted((prev) => new Set(prev).add(id))
    setEditing((prev) => ({ ...prev, [id]: false }))
    setEdited((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const restoreDB = (id: number) => {
    // Simply unmark from deletion set
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
    setSnapshots({})
    setDeleted(new Set())
  }

  // Execute all pending changes in parallel, then refresh data from server
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
    revertRow,
    cancelEdit,
    updateField,
    removeDB,
    restoreDB,
    applyChanges,
    resetState,
    page,
    totalPages: Math.ceil((data?.count ?? 0) / PAGE_SIZE),
    totalCount: data?.count ?? 0,
    hasNext: Boolean(data?.next),
    hasPrevious: Boolean(data?.previous),
    setPage,
  }
}

// Lightweight fetch all for the meantime. I do not like it either but it doesn't make sense
// to have the assertions list unclear. It'll be used for the filters too.
export function useAllClientDBs() {
  return useQuery({
    queryKey: ["clientdbs", "all"],
    queryFn: () => getClientDBs(),
    staleTime: 1000 * 60 * 30,
  })
}
