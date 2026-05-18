import { create } from "zustand"

export type PipelinePhase = "idle" | "generating" | "executing" | "analyzing" | "complete" | "error"

interface LiveAssertion {
  status: "passed" | "failed" | "pending"
  recommendation: string
  streamingDone: boolean
}

interface ComplianceCheckState {
  activeCheckId: number | null
  phase: PipelinePhase
  liveAssertions: Record<number, LiveAssertion>

  setActiveCheckId: (id: number | null) => void
  setPhase: (phase: PipelinePhase) => void
  upsertLiveAssertion: (id: number, patch: Partial<LiveAssertion>) => void
  appendToken: (id: number, token: string) => void
  reset: () => void
}

export const useComplianceCheckStore = create<ComplianceCheckState>((set) => ({
  activeCheckId: null,
  phase: "idle",
  liveAssertions: {},

  setActiveCheckId: (id) => set({ activeCheckId: id }),
  setPhase: (phase) => set({ phase }),

  upsertLiveAssertion: (id, patch) =>
    set((s) => {
      const existing = s.liveAssertions[id] ?? {
        status: "pending" as const,
        recommendation: "",
        streamingDone: false,
      }
      return {
        liveAssertions: {
          ...s.liveAssertions,
          [id]: { ...existing, ...patch },
        },
      }
    }),

  appendToken: (id, token) =>
    set((s) => ({
      liveAssertions: {
        ...s.liveAssertions,
        [id]: {
          ...s.liveAssertions[id],
          recommendation: (s.liveAssertions[id]?.recommendation ?? "") + token,
        },
      },
    })),

  reset: () => set({ activeCheckId: null, phase: "idle", liveAssertions: {} }),
}))
