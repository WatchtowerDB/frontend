import { create } from "zustand"

export type PipelinePhase = "idle" | "generating" | "executing" | "analyzing" | "complete" | "error"

export interface CheckStream {
  phase: PipelinePhase
}

export interface LiveAssertion {
  checkId: number
  status: "passed" | "failed" | "pending"
  recommendation: string
  streamingDone: boolean
}

// Folds all active check phases into the single most-urgent one.
// Used by AssertionsStatus and anywhere a global "are we busy?" signal is needed.
const PHASE_PRIORITY: PipelinePhase[] = [
  "error",
  "analyzing",
  "executing",
  "generating",
  "complete",
  "idle",
]

export function selectOverallPhase(checkStreams: Record<number, CheckStream>): PipelinePhase {
  const phases = Object.values(checkStreams).map((c) => c.phase)
  for (const p of PHASE_PRIORITY) {
    if (phases.includes(p)) return p
  }
  return "idle"
}

interface ComplianceCheckState {
  activeCheckIds: number[]
  checkStreams: Record<number, CheckStream>
  liveAssertions: Record<number, LiveAssertion>

  addActiveCheck: (id: number) => void
  removeActiveCheck: (id: number) => void
  setCheckPhase: (checkId: number, phase: PipelinePhase) => void
  upsertLiveAssertion: (
    assertionId: number,
    checkId: number,
    patch: Partial<Omit<LiveAssertion, "checkId">>,
  ) => void
  appendToken: (assertionId: number, token: string) => void
  clearCompletedChecks: () => void
  reset: () => void
}

export const useComplianceCheckStore = create<ComplianceCheckState>((set) => ({
  activeCheckIds: [],
  checkStreams: {},
  liveAssertions: {},

  addActiveCheck: (id) =>
    set((s) => ({
      activeCheckIds: s.activeCheckIds.includes(id) ? s.activeCheckIds : [...s.activeCheckIds, id],
      checkStreams: {
        ...s.checkStreams,
        [id]: { phase: "idle" },
      },
    })),

  removeActiveCheck: (id) =>
    set((s) => ({
      activeCheckIds: s.activeCheckIds.filter((x) => x !== id),
    })),

  setCheckPhase: (checkId, phase) =>
    set((s) => ({
      checkStreams: {
        ...s.checkStreams,
        [checkId]: { ...s.checkStreams[checkId], phase },
      },
    })),

  upsertLiveAssertion: (assertionId, checkId, patch) =>
    set((s) => {
      const existing = s.liveAssertions[assertionId] ?? {
        checkId,
        status: "pending" as const,
        recommendation: "",
        streamingDone: false,
      }
      return {
        liveAssertions: {
          ...s.liveAssertions,
          [assertionId]: { ...existing, ...patch },
        },
      }
    }),

  appendToken: (assertionId, token) =>
    set((s) => ({
      liveAssertions: {
        ...s.liveAssertions,
        [assertionId]: {
          ...s.liveAssertions[assertionId],
          recommendation: (s.liveAssertions[assertionId]?.recommendation ?? "") + token,
        },
      },
    })),

  // Removes check streams that are complete or errored;
  // leaves liveAssertions intact (they're still displayed).
  clearCompletedChecks: () =>
    set((s) => {
      const remaining = Object.fromEntries(
        Object.entries(s.checkStreams).filter(
          ([, v]) => v.phase !== "complete" && v.phase !== "error",
        ),
      ) as Record<number, CheckStream>
      return { checkStreams: remaining }
    }),

  reset: () => set({ activeCheckIds: [], checkStreams: {}, liveAssertions: {} }),
}))
