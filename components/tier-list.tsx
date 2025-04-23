"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import TierRow from "./tier-row"
import StagingArea from "./staging-area"
import AddItemForm from "./add-item-form"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export interface TierItem {
  name: string
  explanation: string
  id?: string // Add unique ID to prevent duplication issues
}

export interface Tier {
  name: string
  color: string
  items: TierItem[]
}

interface TierListProps {
  data: {
    topic: string
    tiers: Tier[]
  }
  onUpdateTierName?: (tierIndex: number, newName: string) => void
  onUpdateTierColor?: (tierIndex: number, newColor: string) => void
  animation?: boolean
}

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9)

// Helper function to ensure all items have IDs
const ensureItemsHaveIds = (tiers: Tier[]): Tier[] => {
  return tiers.map((tier) => ({
    ...tier,
    items: tier.items.map((item) => ({
      ...item,
      id: item.id || generateId(),
    })),
  }))
}

export default function TierList({ data, onUpdateTierName = () => {}, onUpdateTierColor = () => {}, animation=false }: TierListProps) {
  // Ensure all items have unique IDs to prevent duplication
  const [tiers, setTiers] = useState<Tier[]>(ensureItemsHaveIds(data.tiers))
  const [stagingItems, setStagingItems] = useState<TierItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<TierItem | null>(null)
  const [selectedTierId, setSelectedTierId] = useState<number | null>(0) // Default to first tier

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function sortableKeyboardCoordinates(event: KeyboardEvent) {
    return {
      x: 0,
      y: 0,
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)

    // Find the active item
    const [sourceType, sourceIndex, itemIndex] = (active.id as string).split("-")

    if (sourceType === "tier") {
      const tierIndex = Number.parseInt(sourceIndex)
      const itemIdx = Number.parseInt(itemIndex)
      setActiveItem({ ...tiers[tierIndex].items[itemIdx] })
    } else if (sourceType === "staging") {
      const itemIdx = Number.parseInt(sourceIndex)
      setActiveItem({ ...stagingItems[itemIdx] })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setActiveItem(null)
      return
    }

    if (active.id !== over.id) {
      const [sourceType, sourceIndex, sourceItemIndex] = (active.id as string).split("-")
      const [targetType, targetIndex, targetItemIndex] = (over.id as string).split("-")

      // Source item
      let itemToMove: TierItem | null = null
      let removedFromSource = false

      // Get the item to move
      if (sourceType === "tier") {
        const tierIndex = Number.parseInt(sourceIndex)
        const itemIndex = Number.parseInt(sourceItemIndex)
        itemToMove = { ...tiers[tierIndex].items[itemIndex] }

        // Remove from source tier
        const newTiers = [...tiers]
        newTiers[tierIndex].items.splice(itemIndex, 1)
        setTiers(newTiers)
        removedFromSource = true
      } 
      else if (sourceType === "staging") {
        const itemIndex = Number.parseInt(sourceIndex)
        itemToMove = { ...stagingItems[itemIndex] }

        // We'll remove from staging later to handle the same container scenario correctly
      }

      if (!itemToMove) {
        setActiveId(null)
        setActiveItem(null)
        return
      }

      // Ensure the item has a unique ID
      if (!itemToMove.id) {
        itemToMove.id = generateId()
      }

      // Add to target
      if (targetType === "tier") {
        const newTiers = [...tiers]
        const tierIndex = Number.parseInt(targetIndex)

        // If source was staging, remove from staging now
        if (sourceType === "staging" && !removedFromSource) {
          const itemIndex = Number.parseInt(sourceIndex)
          const newStagingItems = [...stagingItems]
          newStagingItems.splice(itemIndex, 1)
          setStagingItems(newStagingItems)
        }

        // If dropping into an empty tier or at a specific position
        if (targetItemIndex === "empty") {
          newTiers[tierIndex].items.push(itemToMove)
        } else {
          const itemIndex = Number.parseInt(targetItemIndex)
          newTiers[tierIndex].items.splice(itemIndex, 0, itemToMove)
        }

        setTiers(newTiers)
      } 
      else if (targetType === "staging") {
        // Handle moving within the staging area
        const newStagingItems = [...stagingItems]
        
        // If this is a within-staging move, remove source first
        if (sourceType === "staging" && !removedFromSource) {
          const sourceIdx = Number.parseInt(sourceIndex)
          newStagingItems.splice(sourceIdx, 1)
        }

        // Now add to target position
        if (targetItemIndex === "empty") {
          newStagingItems.push(itemToMove)
        } else {
          const targetIdx = Number.parseInt(targetItemIndex)
          
          // If we're moving within the same container and the target index is after the source index,
          // we need to adjust the target index to account for the removed item
          if (sourceType === "staging" && targetType === "staging" && 
              Number.parseInt(sourceIndex) < targetIdx) {
            newStagingItems.splice(targetIdx - 1, 0, itemToMove)
          } else {
            newStagingItems.splice(targetIdx, 0, itemToMove)
          }
        }

        setStagingItems(newStagingItems)
      }
    }

    setActiveId(null)
    setActiveItem(null)
  }

  const handleAddItem = (item: TierItem, destination: string) => {
    // Ensure new items have unique IDs
    const newItem = {
      ...item,
      id: generateId(),
    }

    // Add to the selected destination
    if (destination === "staging") {
      setStagingItems([...stagingItems, newItem])
    } else {
      // The destination is a tier index
      const tierIndex = Number.parseInt(destination, 10)
      if (tierIndex >= 0 && tierIndex < tiers.length) {
        const newTiers = [...tiers]
        newTiers[tierIndex].items.push(newItem)
        setTiers(newTiers)
      }
    }
  }

  const handleUpdateTierName = (tierIndex: number, newName: string) => {
    const newTiers = [...tiers]
    newTiers[tierIndex].name = newName
    setTiers(newTiers)
    onUpdateTierName(tierIndex, newName)
  }

  const handleUpdateTierColor = (tierIndex: number, newColor: string) => {
    const newTiers = [...tiers]
    newTiers[tierIndex].color = newColor
    setTiers(newTiers)
    onUpdateTierColor(tierIndex, newColor)
  }

  const handleRemoveTier = (tierIndex: number) => {
    // Move all items from the tier to the staging area
    const itemsToMove = [...tiers[tierIndex].items]
    setStagingItems([...stagingItems, ...itemsToMove])

    // Remove the tier
    const newTiers = [...tiers]
    newTiers.splice(tierIndex, 1)
    setTiers(newTiers)
  }

  const handleAddTier = () => {
    // Generate a random color
    const colors = ["#FFD700", "#3b82f6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    // Add a new tier
    const newTier: Tier = {
      name: String.fromCharCode(65 + tiers.length), // A, B, C, etc.
      color: randomColor,
      items: [],
    }

    setTiers([...tiers, newTier])
  }

  const handleSelectTier = (tierIndex: number) => {
    setSelectedTierId(tierIndex)
  }

  // Create destination options for the AddItemForm
  const destinationOptions = [
    ...tiers.map((tier, index) => ({
      value: index.toString(),
      label: `${tier.name} Tier`,
    })),
    { value: "staging", label: "Staging Area" },
  ]

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="space-y-4">
          {tiers.map((tier, tierIndex) => (
            <TierRow
              key={tierIndex}
              tier={tier}
              tierIndex={tierIndex}
              isSelected={selectedTierId === tierIndex}
              onSelectTier={() => handleSelectTier(tierIndex)}
              onUpdateTierName={handleUpdateTierName}
              onUpdateTierColor={handleUpdateTierColor}
              onRemoveTier={handleRemoveTier}
            />
          ))}

{
  animation ? <></> :
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={handleAddTier} className="flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Tier
            </Button>
          </div>
}
        </div>

        <StagingArea items={stagingItems} />

          {
            animation ? <></> :

            <>
            

        <div className="mt-8 border-t pt-6 border-gray-200 dark:border-gray-700">
          <AddItemForm onAddItem={handleAddItem} destinationOptions={destinationOptions} />
        </div>
            </>
          }
      </div>

      {typeof window !== "undefined" &&
        activeItem &&
        createPortal(
          <DragOverlay>
            {activeItem && (
              <div className="bg-white dark:bg-gray-700 px-3 py-2 rounded shadow-md flex items-center gap-2 border-2 border-blue-500">
                <span className="text-gray-900 dark:text-gray-100">{activeItem.name}</span>
              </div>
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  )
}