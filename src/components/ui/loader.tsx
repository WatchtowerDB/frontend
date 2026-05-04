import "./loader.css"

interface LoaderProps {
  className?: string
}

export const Loader = ({ className }: LoaderProps) => {
  return <div className={`chaotic-orbit ${className}`}></div>
}

export default Loader
