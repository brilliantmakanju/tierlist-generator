"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface StepTwoProps {
  formData: {
    topic: string
    items: string
    useAIItems: boolean
    criteria: string[]
    useAICriteria: boolean
  }
  updateFormData: (data: Partial<StepTwoProps["formData"]>) => void
}

export default function StepTwo({ formData, updateFormData }: StepTwoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Step 2: Upload or Enter Items to Rank
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enter each item on a new line or let AI choose items for you.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="useAIItems"
            checked={formData.useAIItems}
            onCheckedChange={(checked) => updateFormData({ useAIItems: checked })}
          />
          <Label htmlFor="useAIItems">Let AI choose items for me</Label>
        </div>

        {!formData.useAIItems && (
          <div>
            <Label htmlFor="items">Items to Rank</Label>
            <Textarea
              id="items"
              placeholder="Enter each item on a new line, e.g.:
McDonalds
Burger King
In-N-Out
Five Guys"
              value={formData.items}
              onChange={(e) => updateFormData({ items: e.target.value })}
              className="mt-1 h-40"
            />
          </div>
        )}

        {formData.useAIItems && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI will automatically generate relevant items based on your topic:
              <span className="font-medium text-gray-900 dark:text-white ml-1">
                {formData.topic || "Please enter a topic in Step 1"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
