import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react"
import { Button } from "./ui/button"

type SortOption = {
  label: string
  value: string
  icon?: LucideIcon
}

type SortControlsProps = {
  options: SortOption[]
  value: string[]
  onChange: (value: string[]) => void
  allowEmptySort?: boolean
}

export default function SortsControls({
  options,
  value,
  onChange,
  allowEmptySort = false,
}: SortControlsProps) {
  // To keep the order the options are in visually
  const sortedOptions = [
    ...value.map((v) => options.find((o) => o.value === v.replace(/^-/, ""))!).filter(Boolean),
    ...options.filter((o) => !value.includes(o.value) && !value.includes(`-${o.value}`)),
  ]

  const handleClick = (option: SortOption) => {
    const isAsc = value.includes(option.value)
    const isDesc = value.includes(`-${option.value}`)

    if (isAsc) {
      // ascending to descending
      onChange(value.map((v) => (v === option.value ? `-${option.value}` : v)))
    } else if (isDesc) {
      // descending to inactive (but only if there's at least a single selected sort and it doesn't allow empty sort)
      if (value.length === 1 && !allowEmptySort) {
        onChange(value.map((v) => (v === `-${option.value}` ? option.value : v)))
      } else {
        onChange(value.filter((v) => v !== `-${option.value}`))
      }
    } else {
      // inactive to ascending
      onChange([...value, option.value])
    }
  }

  return (
    <div className="flex w-full items-center">
      <span className="text-muted-foreground me-2 text-sm">Sort by</span>
      <AnimatePresence mode="popLayout">
        {sortedOptions.map((option, index) => {
          const IconComponent = option.icon
          const isAsc = value.includes(option.value)
          const isDesc = value.includes(`-${option.value}`)
          const isFirst = index === 0
          const isLast = index === sortedOptions.length - 1
          const isActive = isAsc || isDesc
          return (
            <motion.div
              key={option.value}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Button
                variant={isActive ? "default" : "secondary"}
                key={option.label}
                onClick={() => handleClick(option)}
                className={`rounded-none border-r-0 ${isFirst ? "rounded-l-full" : ""} ${isLast ? "rounded-r-full border-r" : ""}`}
              >
                {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                <span>{option.label}</span>
                {isAsc ? (
                  <ChevronUp className="h-3 w-3" />
                ) : isDesc ? (
                  <ChevronDown className="h-3 w-3" />
                ) : null}
              </Button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
