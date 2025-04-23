"use client"

import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import SortableItem from "./sortable-item"
import DroppableArea from "./droppable-area"
import type { TierItem } from "./tier-list"

interface StagingAreaProps {
  items: TierItem[]
}

export default function StagingArea({ items }: StagingAreaProps) {
  // Create IDs for the sortable items
  const itemIds = items.map((_, index) => `staging-${index}`)

  return (
    <div className="mt-8 border-t pt-4 border-gray-200 dark:border-gray-700 staging-area">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Staging Area</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Drag items here to save them for later use</p>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 min-h-[5rem]">
            {items.map((item, index) => (
              <SortableItem key={`staging-${index}`} id={`staging-${index}`} item={item} />
            ))}

            {items.length === 0 && <DroppableArea id="staging-empty" />}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
