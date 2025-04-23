"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface StepThreeProps {
  formData: {
    topic: string
    items: string
    useAIItems: boolean
    criteria: string[]
    useAICriteria: boolean
  }
  updateFormData: (data: Partial<StepThreeProps["formData"]>) => void
}

export default function StepThree({ formData, updateFormData }: StepThreeProps) {
  const [newCriterion, setNewCriterion] = useState("")

  const addCriterion = () => {
    if (newCriterion.trim() && !formData.criteria.includes(newCriterion.trim())) {
      updateFormData({ criteria: [...formData.criteria, newCriterion.trim()] })
      setNewCriterion("")
    }
  }

  const removeCriterion = (index: number) => {
    const newCriteria = [...formData.criteria]
    newCriteria.splice(index, 1)
    updateFormData({ criteria: newCriteria })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCriterion()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Step 3: Define Ranking Criteria (Optional)
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Add custom criteria for ranking or let AI decide based on general context.
        </p>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="useAICriteria"
            checked={formData.useAICriteria}
            onCheckedChange={(checked) => updateFormData({ useAICriteria: checked })}
          />
          <Label htmlFor="useAICriteria">Let AI decide based on general context</Label>
        </div>

        {!formData.useAICriteria && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., taste, price, speed, aesthetic"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <Button onClick={addCriterion} type="button">
                Add
              </Button>
            </div>

            {formData.criteria.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <span className="text-sm text-gray-800 dark:text-gray-200">{criterion}</span>
                    <button
                      type="button"
                      onClick={() => removeCriterion(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.criteria.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No criteria added yet. Add some or switch to AI-decided criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
