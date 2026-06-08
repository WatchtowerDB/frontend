import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react"
import { Button } from "./ui/button"

type SortOption = {
  label: string
  value: string
  icon?: LucideIcon
  alwaysActive?: boolean
}

type SortControlsProps = {
  options: SortOption[]
  value: string[]
  onChange: (value: string[]) => void
}

export default function SortsControls({ options, value, onChange }: SortControlsProps) {
  // To keep the order the options are in
  const normalize = (next: string[]) =>
    options
      .filter((opt) => next.includes(opt.value) || next.includes(`-${opt.value}`))
      .map((opt) => (next.includes(`-${opt.value}`) ? `-${opt.value}` : opt.value))

  const handleClick = (option: SortOption) => {
    const isAsc = value.includes(option.value)
    const isDesc = value.includes(`-${option.value}`)

    if (isAsc) {
      // ascending to descending
      onChange(normalize(value.map((v) => (v === option.value ? `-${option.value}` : v))))
    } else if (isDesc) {
      // descending to inactive (but only if not alwaysActive)
      if (option.alwaysActive) {
        onChange(normalize(value.map((v) => (v === `-${option.value}` ? option.value : v))))
      } else {
        onChange(normalize(value.filter((v) => v !== `-${option.value}`)))
      }
    } else {
      // inactive to ascending
      onChange(normalize([...value, option.value]))
    }
  }

  return (
    <div className="flex w-full items-center gap-2">
      <span className="text-muted-foreground text-sm">Sort by</span>

      {options.map((option) => {
        const IconComponent = option.icon
        const isAsc = value.includes(option.value)
        const isDesc = value.includes(`-${option.value}`)
        const isActive = isAsc || isDesc
        return (
          <Button
            variant={isActive ? "secondary" : "outline"}
            key={option.label}
            onClick={() => handleClick(option)}
          >
            {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
            <span>{option.label}</span>
            {isAsc ? (
              <ChevronUp className="h-3 w-3" />
            ) : isDesc ? (
              <ChevronDown className="h-3 w-3" />
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}
