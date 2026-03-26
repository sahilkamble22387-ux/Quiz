import useCursor from '../hooks/useCursor'
import './Cursor.css'

export default function Cursor() {
  useCursor()

  return (
    <>
      <div id="cursor-dot" />
      <div id="cursor-ring" />
    </>
  )
}
