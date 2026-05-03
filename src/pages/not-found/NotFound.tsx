import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function NotFound() {
  const Navigate = useNavigate()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-10">
      <h2 className="items-center text-9xl">:(</h2>
      <div>
        <span className="flex truncate text-center font-semibold transition-colors duration-200">
          Nothing ventured, nothing gained. <br /> But nothing found.
        </span>
      </div>
      <Button variant="outline" onClick={() => Navigate("/")}>
        Go back
      </Button>
    </div>
  )
}

export default NotFound
