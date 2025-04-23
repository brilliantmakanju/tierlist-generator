"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TierItem } from "./tier-list"

interface DestinationOption {
  value: string
  label: string
}

interface AddItemFormProps {
  onAddItem: (item: TierItem, destination: string) => void
  destinationOptions: DestinationOption[]
}

export default function AddItemForm({ onAddItem, destinationOptions }: AddItemFormProps) {
  const [name, setName] = useState("")
  const [explanation, setExplanation] = useState("")
  const [destination, setDestination] = useState(destinationOptions[0]?.value || "0")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim()) {
      onAddItem(
        {
          name: name.trim(),
          explanation: explanation.trim() || "No explanation provided.",
        },
        destination,
      )

      // Reset form
      setName("")
      setExplanation("")
    }
  }

  // Find the selected destination label
  const selectedDestinationLabel = destinationOptions.find((option) => option.value === destination)?.label || "Tier"

  return (
    <div className="add-item-form">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Add New Item</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="item-name">Item Name</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            required
          />
        </div>

        <div>
          <Label htmlFor="item-explanation">Explanation (Optional)</Label>
          <Textarea
            id="item-explanation"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Why does this item belong in this tier?"
            className="h-20"
          />
        </div>

        <div>
          <Label htmlFor="destination">Add to</Label>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {destinationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={!name.trim()}>
          Add to {selectedDestinationLabel}
        </Button>
      </form>
    </div>
  )
}
