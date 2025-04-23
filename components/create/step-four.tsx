interface StepFourProps {
  formData: {
    topic: string
    items: string
    useAIItems: boolean
    criteria: string[]
    useAICriteria: boolean
  }
}

export default function StepFour({ formData }: StepFourProps) {
  const itemsList = formData.items
    .split("\n")
    .filter((item) => item.trim())
    .map((item) => item.trim())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Step 4: Review and Generate</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Review your tier list details and click "Generate Tier List" when ready.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Topic</h3>
          <p className="text-gray-700 dark:text-gray-300">{formData.topic || "No topic specified"}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Items</h3>
          {formData.useAIItems ? (
            <p className="text-gray-700 dark:text-gray-300 italic">AI will generate items based on the topic</p>
          ) : itemsList.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
              {itemsList.slice(0, 5).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
              {itemsList.length > 5 && <li className="italic">...and {itemsList.length - 5} more items</li>}
            </ul>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 italic">No items specified</p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Criteria</h3>
          {formData.useAICriteria ? (
            <p className="text-gray-700 dark:text-gray-300 italic">
              AI will determine appropriate criteria based on the topic
            </p>
          ) : formData.criteria.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.criteria.map((criterion, index) => (
                <span
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-sm text-gray-800 dark:text-gray-200"
                >
                  {criterion}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 italic">No criteria specified</p>
          )}
        </div>
      </div>
    </div>
  )
}
