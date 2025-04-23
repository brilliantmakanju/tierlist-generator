"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import Footer from "@/components/footer"
import StepOne from "@/components/create/step-one"
import StepTwo from "@/components/create/step-two"
import StepThree from "@/components/create/step-three"
import StepFour from "@/components/create/step-four"
import { useRouter } from "next/navigation"
import { generateAIContent } from "@/lib/generate"

export type FormData = {
  topic: string;
  items: string;
  useAIItems: boolean;
  criteria: string[];
  useAICriteria: boolean
}

export default function CreatePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    topic: "",
    items: "",
    useAIItems: true,
    criteria: [] as string[],
    useAICriteria: true,
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    console.log(formData, "Form Data")
    // // Simulate API call
    // setTimeout(() => {
    //   setIsLoading(false)
    //   router.push("/results")
    // }, 2000)
    // setIsLoading(true);
    // // setError(null);
    
    try {
      console.log("Submitting form data:", formData);
      const result = await generateAIContent(formData);
      
      if (result.success) {
        // Navigate to results page with a query param
        // The actual data is stored securely in an HTTP-only cookie
        router.push(`/results?generated=true`);
      } else {
        // setError(result.error || 'Failed to generate content');
        setIsLoading(false);
      }
    } catch (err) {
      // setError('An unexpected error occurred');
      setIsLoading(false);
      console.error(err);
    }



  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Create Your Tier List</h1>
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step === currentStep
                        ? "bg-[#3b82f6] text-white"
                        : step < currentStep
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`w-10 h-1 ${step < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
          {currentStep === 1 && <StepOne formData={formData} updateFormData={updateFormData} />}
          {currentStep === 2 && <StepTwo formData={formData} updateFormData={updateFormData} />}
          {currentStep === 3 && <StepThree formData={formData} updateFormData={updateFormData} />}
          {currentStep === 4 && <StepFour formData={formData} />}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          {currentStep < 4 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleGenerate} disabled={isLoading} className="bg-[#3b82f6] hover:bg-[#2563eb]">
              {isLoading ? "Consulting the Tier Gods..." : "Generate Tier List"}
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
