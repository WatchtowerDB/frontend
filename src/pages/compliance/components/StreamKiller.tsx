// // This is a debug utility that relies on something else existing that conditionally does. Dont mind it.
// import { useComplianceStreams } from "@/hooks/useComplianceStream"
// import { useState } from "react"

// export function ComplianceActionButton() {
//   const { abortStreamManual } = useComplianceStreams()
//   const [inputCheckId, setInputCheckId] = useState<string>("")
//   const [capturedId, setCapturedId] = useState<string | null>(null)
//   const [errorLog, setErrorLog] = useState<string | null>(null)

//   const handleStopAndCapture = () => {
//     // Reset output states before processing
//     setCapturedId(null)
//     setErrorLog(null)

//     // Convert input text to a numeric base-10 ID
//     const targetId = parseInt(inputCheckId.trim(), 10)

//     // Validation guard — don't process if it's not a real number
//     if (isNaN(targetId)) {
//       setErrorLog("Fool! Enter a valid numeric Check ID.")
//       return
//     }

//     // Invoke the exposed hook action with the user's parsed number
//     const eventId = abortStreamManual(targetId)

//     setCapturedId(eventId)

//     if (eventId) {
//       console.log(`[WATCHTOWER SUCCESS] Captured Last-Event-ID for stream ${targetId}: ${eventId}`)
//     } else {
//       console.log(`Stream ${targetId} stopped, but no Event ID was cached. Either it wasn't running, or no events arrived yet.`)
//     }
//   }

//   return (
//     <div className="flex flex-col gap-4 p-4 border border-zinc-800 rounded-md bg-zinc-950 max-w-md">
//       <div className="flex flex-col gap-1.5">
//         <label htmlFor="check-id-input" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
//           Target Check ID
//         </label>
//         <input
//           id="check-id-input"
//           type="text"
//           value={inputCheckId}
//           onChange={(e) => setInputCheckId(e.target.value)}
//           placeholder="e.g. 104"
//           className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white focus:outline-none focus:border-red-500 font-mono transition-all"
//         />
//       </div>

//       <button
//         onClick={handleStopAndCapture}
//         className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-bold rounded tracking-wide transition-all shadow-md active:scale-[0.98]"
//         disabled={!inputCheckId.trim()}
//       >
//         HALT STREAM & EXTRACT ID
//       </button>

//       {/* Error Output feedback channel */}
//       {errorLog && (
//         <div className="text-sm text-red-400 font-medium">
//           {errorLog}
//         </div>
//       )}

//       {/* Captured Event ID feedback channel */}
//       {capturedId && (
//         <div className="p-2 bg-zinc-900 border border-emerald-900/50 rounded text-sm font-mono flex flex-col gap-0.5">
//           <span className="text-xs text-zinc-500 uppercase font-sans font-bold">Captured Last-Event-ID:</span>
//           <span className="text-emerald-400 break-all font-bold">{capturedId}</span>
//         </div>
//       )}
//     </div>
//   )
// }
