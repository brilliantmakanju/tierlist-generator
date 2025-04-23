"use client"

import type React from "react"

import { useState } from "react"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { Pencil, Check, Trash2, Palette } from "lucide-react"
import SortableItem from "./sortable-item"
import DroppableArea from "./droppable-area"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Tier } from "./tier-list"

interface TierRowProps {
  tier: Tier
  tierIndex: number
  isSelected?: boolean
  onSelectTier: () => void
  onUpdateTierName: (tierIndex: number, newName: string) => void
  onUpdateTierColor: (tierIndex: number, newColor: string) => void
  onRemoveTier: (tierIndex: number) => void
}

const PRESET_COLORS = [
  "#FFD700", // Gold
  "#3b82f6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6B7280", // Gray
  "#000000", // Black
]

export default function TierRow({
  tier,
  tierIndex,
  isSelected = false,
  onSelectTier,
  onUpdateTierName,
  onUpdateTierColor,
  onRemoveTier,
}: TierRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tierName, setTierName] = useState(tier.name)

  // Create IDs for the sortable items
  const itemIds = tier.items.map((_, index) => `tier-${tierIndex}-${index}`)

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSaveClick = () => {
    if (tierName.trim()) {
      onUpdateTierName(tierIndex, tierName.trim())
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveClick()
    } else if (e.key === "Escape") {
      setTierName(tier.name)
      setIsEditing(false)
    }
  }

  const handleColorSelect = (color: string) => {
    onUpdateTierColor(tierIndex, color)
  }

  return (
    <div className={`flex group ${isSelected ? "ring-2 ring-blue-500 rounded-md" : ""}`} onClick={onSelectTier}>
      <div
        className="flex-shrink-0 w-16 h-16 flex items-center justify-center text-white font-bold text-xl rounded-l-md relative"
        style={{ backgroundColor: tier.color }}
      >
        {isEditing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-80 rounded-l-md">
            <Input
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-12 h-8 text-center text-black"
              autoFocus
              maxLength={3}
            />
            <button
              onClick={handleSaveClick}
              className="absolute right-0 top-0 p-1 text-green-400 hover:text-green-300"
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <>
            {tier.name}
            <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
              <button
                onClick={handleEditClick}
                className="p-1 text-white opacity-70 hover:opacity-100 bg-black bg-opacity-30 rounded-sm"
                title="Edit tier name"
              >
                <Pencil size={12} />
              </button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="p-1 text-white opacity-70 hover:opacity-100 bg-black bg-opacity-30 rounded-sm"
                    title="Change tier color"
                  >
                    <Palette size={12} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Select Tier Color</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          className="w-full h-8 rounded-md border border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorSelect(color)}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="pt-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Custom color</label>
                      <input
                        type="color"
                        value={tier.color}
                        onChange={(e) => handleColorSelect(e.target.value)}
                        className="w-full h-8 cursor-pointer"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-r-md min-h-16 p-2 relative">
        <SortableContext items={itemIds} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2 min-h-[3rem]">
            {tier.items.map((item, itemIndex) => (
              <SortableItem key={`tier-${tierIndex}-${itemIndex}`} id={`tier-${tierIndex}-${itemIndex}`} item={item} />
            ))}

            {tier.items.length === 0 && <DroppableArea id={`tier-${tierIndex}-empty`} />}
          </div>
        </SortableContext>

        <button
          onClick={() => onRemoveTier(tierIndex)}
          className="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove tier"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
