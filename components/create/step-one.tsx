"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StepOneProps {
  formData: {
    topic: string
    items: string
    useAIItems: boolean
    criteria: string[]
    useAICriteria: boolean
  }
  updateFormData: (data: Partial<typeof formData>) => void
}

export default function StepOne({ formData, updateFormData }: StepOneProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Step 1: Enter Tier List Topic</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          What would you like to rank? Be specific to get better results.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="topic">Tier List Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., Fast food chains, programming languages, superhero movies"
            value={formData.topic}
            onChange={(e) => updateFormData({ topic: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
