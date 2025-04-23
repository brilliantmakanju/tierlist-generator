"use client"

import { useDroppable } from "@dnd-kit/core"

interface DroppableAreaProps {
  id: string
}

export default function DroppableArea({ id }: DroppableAreaProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-12 flex items-center justify-center text-gray-400 italic border-2 ${
        isOver ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-dashed border-gray-300 dark:border-gray-600"
      } rounded`}
    >
      Drag items here
    </div>
  )
}
