"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Info, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TierItem } from "./tier-list"

interface SortableItemProps {
  id: string
  item: TierItem
  onDelete?: () => void
}

export default function SortableItem({ id, item, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 px-3 py-2 rounded shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-2 group relative"
    >
      <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Info size={16} />
              <span className="sr-only">Item explanation</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{item.explanation}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={12} />
          <span className="sr-only">Delete item</span>
        </button>
      )}
    </div>
  )
}
