"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TierList, { TierItem } from "@/components/tier-list"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, History, Edit, Play, Square, Video, AlertTriangle, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import html2canvas from "html2canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { fetchResult } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define TypeScript interfaces
interface TierItemInterface {
  name: string;
  explanation: string;
}

interface TierInterface {
  name: string;
  color: string;
  items: TierItemInterface[];
}

interface TierListDataInterface {
  topic: string;
  tiers: TierInterface[];
}

// Empty tier list template
const emptyTierListData: TierListDataInterface = {
  topic: "Loading...",
  tiers: [
    { name: "S", color: "#FFD700", items: [] },
    { name: "A", color: "#3b82f6", items: [] },
    { name: "B", color: "#10B981", items: [] },
    { name: "C", color: "#F59E0B", items: [] },
    { name: "D", color: "#EF4444", items: [] },
  ],
}

// Function to save tier list to localStorage
const saveTierListToStorage = (tierList: TierListDataInterface): void => {
  try {
    localStorage.setItem("previousTierList", JSON.stringify(tierList))
  } catch (error) {
    // Silently fail
  }
}

// Function to get tier list from localStorage
const getPreviousTierList = (): TierListDataInterface | null => {
  try {
    const savedTierList = localStorage.getItem("previousTierList")
    return savedTierList ? JSON.parse(savedTierList) : null
  } catch (error) {
    return null
  }
}

// Function to check supported MIME types for recording
const getSupportedMimeType = (): string => {
  const possibleTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4'
  ];
  
  for (const type of possibleTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return ''; // No supported types found
}

export default function ResultsPage() {
  const [tierListData, setTierListData] = useState<TierListDataInterface>(emptyTierListData)
  const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
  const [listName, setListName] = useState<string>("Loading...")
  const [isEditingName, setIsEditingName] = useState<boolean>(false)
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
  const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingTime, setRecordingTime] = useState<number>(0)
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
  const [frameRate, setFrameRate] = useState<number>(30) // Default frame rate
  const [recordingDialogOpen, setRecordingDialogOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const tierListRef = useRef<HTMLDivElement>(null)
  const exportContainerRef = useRef<HTMLDivElement>(null)
  const recordingRef = useRef<HTMLCanvasElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const animationDialogRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  
  const getResults = async () => {
    try {
      // setLoading(true)
      // setError(null)
      console.log("Starting")
      
      // Get data from localStorage
      const rawData = localStorage.getItem("TierList")
      
      if (!rawData) {
        setError("No tier list found in localStorage");
        return null;
      }
      
      let jsonContent: TierListDataInterface | null = null;
      
      try {
        // First parse the raw data from localStorage
        const parsedData = JSON.parse(rawData);
        
        // Check if the data has a content property that's a string
        if (parsedData.content && typeof parsedData.content === 'string') {
          // Parse the nested JSON string
          jsonContent = JSON.parse(parsedData.content);
        } else {
          // If it's already an object, use it directly
          jsonContent = parsedData;
        }
        
        // Validate the tier list data structure
        if (jsonContent && jsonContent.topic && jsonContent.tiers) {
          setTierListData(jsonContent);
          setListName(jsonContent.topic);
          return jsonContent;
        } else {
          throw new Error("Invalid tier list data format");
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        setError("Failed to parse the tier list data. Please try again.");
        throw parseError;
      }
    } catch (err) {
      console.error("Error in getResults:", err);
      setError('An unexpected error occurred while loading your tier list');
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Fetch tier list data from server
  useEffect(() => {
    getResults();
  }, []);

  // Load previous tier list from localStorage on component mount
  useEffect(() => {
    const savedTierList = getPreviousTierList()
    if (savedTierList) {
      setPreviousTierList(savedTierList)
    }
  }, [])

  // Cleanup function for recording
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      
      if (recordingTimer) {
        clearInterval(recordingTimer)
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [recordingTimer])

  // Handle dialog close - stop recording if dialog closes
  useEffect(() => {
    if (!recordingDialogOpen && isRecording) {
      stopRecording()
    }
  }, [recordingDialogOpen])

  // Update recordingDialogOpen data whenever tierListData changes
  useEffect(() => {
    // This ensures the recording dialog always has the most current data
    if (recordingDialogOpen) {
      // Force a re-render of the dialog by closing and reopening it
      setRecordingDialogOpen(false);
      setTimeout(() => setRecordingDialogOpen(true), 10);
    }
  }, [tierListData]);

  const handleUpdateTierName = (tierIndex: number, newName: string): void => {
    const newTiers = [...tierListData.tiers]
    newTiers[tierIndex].name = newName
    setTierListData({
      ...tierListData,
      tiers: newTiers,
    })
  }

  const handleUpdateTierColor = (tierIndex: number, newColor: string): void => {
    const newTiers = [...tierListData.tiers]
    newTiers[tierIndex].color = newColor
    setTierListData({
      ...tierListData,
      tiers: newTiers,
    })
  }

  // New function to delete an item from a tier
  const handleDeleteItem = (tierIndex: number, itemIndex: number): void => {
    const newTiers = [...tierListData.tiers];
    newTiers[tierIndex].items = newTiers[tierIndex].items.filter((_, idx) => idx !== itemIndex);
    
    setTierListData({
      ...tierListData,
      tiers: newTiers,
    });
    
    toast({
      title: "Item removed",
      description: "The item has been removed from the tier list.",
    });
  }

  const handleRegenerate = (): void => {
    setIsRegenerating(true)

    // Save current tier list before regenerating
    saveTierListToStorage(tierListData)
    setPreviousTierList(tierListData)

    // Redirect to form page to generate a new tier list
    router.push('/create')
    
    toast({
      title: "Generating new tier list",
      description: "Please enter your criteria for a new tier list.",
    })
  }

  // const handleDownloadAsImage = async (): Promise<void> => {
  //   if (!tierListRef.current) return

  //   try {
  //     toast({
  //       title: "Preparing download",
  //       description: "Your tier list image is being generated...",
  //     })

  //     // Create a temporary container for the export
  //     const exportContainer = document.createElement("div")
  //     exportContainer.style.position = "absolute"
  //     exportContainer.style.left = "-9999px"
  //     exportContainer.style.top = "-9999px"
  //     exportContainer.style.width = "1920px" // Base width for 4K scaling
  //     exportContainer.style.padding = "40px"
  //     exportContainer.style.backgroundColor = "white"
  //     document.body.appendChild(exportContainer)

  //     // Clone the current tier list for export instead of using a separate exportContainerRef
  //     const tierListClone = tierListRef.current.cloneNode(true) as HTMLElement

  //     // Remove any buttons, tooltips, interactive elements, or delete buttons
  //     const elementsToRemove = tierListClone.querySelectorAll('button, [role="button"], .delete-btn');
  //     elementsToRemove.forEach((el: Element) => el.remove());

  //     // Add title
  //     const titleElement = document.createElement("h1")
  //     titleElement.textContent = `${listName} Tier List`
  //     titleElement.style.fontSize = "48px"
  //     titleElement.style.fontWeight = "bold"
  //     titleElement.style.marginBottom = "24px"
  //     titleElement.style.textAlign = "center"
  //     titleElement.style.color = "#1e1e1e"

  //     // Add watermark
  //     const watermarkElement = document.createElement("div")
  //     watermarkElement.textContent = "Tier Gods"
  //     watermarkElement.style.position = "absolute"
  //     watermarkElement.style.bottom = "20px"
  //     watermarkElement.style.right = "20px"
  //     watermarkElement.style.fontSize = "24px"
  //     watermarkElement.style.opacity = "0.3"
  //     watermarkElement.style.fontWeight = "bold"
  //     watermarkElement.style.color = "#1e1e1e"

  //     // Add elements to export container
  //     exportContainer.appendChild(titleElement)
  //     exportContainer.appendChild(tierListClone)
  //     exportContainer.appendChild(watermarkElement)

  //     // If not including explanations, hide them
  //     if (!includeExplanations) {
  //       const explanations = exportContainer.querySelectorAll(".item-explanation")
  //       explanations.forEach((explanation) => {
  //         (explanation as HTMLElement).style.display = "none"
  //       })
  //     }

  //     // Generate high-resolution image
  //     const canvas = await html2canvas(exportContainer, {
  //       backgroundColor: "#ffffff",
  //       scale: 2, // Higher quality
  //       width: 1920, // Base width for 4K
  //       height: exportContainer.offsetHeight,
  //       logging: false,
  //     })

  //     // Clean up
  //     document.body.removeChild(exportContainer)

  //     // Download the image
  //     const image = canvas.toDataURL("image/png")
  //     const link = document.createElement("a")
  //     link.href = image
  //     link.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list.png`
  //     link.click()

  //     toast({
  //       title: "Download complete",
  //       description: "Your tier list image has been downloaded.",
  //     })
  //   } catch (error) {
  //     toast({
  //       title: "Download failed",
  //       description: "There was an error generating your tier list image.",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleUpdateListName = (newName: string): void => {
    if (newName.trim()) {
      setListName(newName.trim())
      setIsEditingName(false)
    }
  }
  
  const renderFrame = (): void => {
    if (!isRecording || !recordingRef.current || !animationDialogRef.current) return
    
    const canvas = recordingRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear the canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw the tier list dialog at high resolution
    html2canvas(animationDialogRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      allowTaint: true,
      useCORS: true
    }).then(dialogCanvas => {
      // Center the dialog in the 4K canvas
      const scaleRatio = Math.min(
        canvas.width / dialogCanvas.width, 
        canvas.height / dialogCanvas.height
      ) * 0.9 // Leave some margin
      
      const scaledWidth = dialogCanvas.width * scaleRatio
      const scaledHeight = dialogCanvas.height * scaleRatio
      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2
      
      ctx.drawImage(
        dialogCanvas, 
        0, 0, dialogCanvas.width, dialogCanvas.height,
        x, y, scaledWidth, scaledHeight
      )
      
      // Continue rendering if still recording
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(renderFrame)
      }
    }).catch(() => {
      // Continue trying to render if still recording
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(renderFrame)
      }
    })
  }

  const stopRecording = (): void => {
    // Stop the media recorder first to trigger ondataavailable and onstop events
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {
        // Ignore errors when stopping recorder
      }
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      } catch (e) {
        // Ignore errors when stopping stream
      }
    }
    
    // Clear the interval timer
    if (recordingTimer) {
      clearInterval(recordingTimer)
      setRecordingTimer(null)
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Reset recording state
    setIsRecording(false)
    setRecordingTime(0)
  }

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
        <Header />
        <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your tier list...</h2>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
        <Header />
        <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="text-center mt-8">
            <Button onClick={() => router.push('/')}>
              Create New Tier List
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }


        //   <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        //   <div ref={tierListRef}>
        //     <TierList
        //       data={{ ...tierListData, topic: listName }}
        //       onUpdateTierName={handleUpdateTierName}
        //       onUpdateTierColor={handleUpdateTierColor}
        //     />
        //   </div>
        // </div>

        {/* Hidden container for export */}
        // <div className="hidden">
        //   <div ref={exportContainerRef} className="p-8 bg-white">
        //     <div className="space-y-4">
        //       {tierListData.tiers.map((tier, index) => (
        //         <div key={index} className="flex">
        //           <div
        //             className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-l-md"
        //             style={{ backgroundColor: tier.color }}
        //           >
        //             {tier.name}
        //           </div>
        //           <div className="flex-1 bg-gray-100 rounded-r-md min-h-20 p-4">
        //             <div className="flex flex-wrap gap-3">
        //               {tier.items.map((item, itemIndex) => (
        //                 <div key={itemIndex} className="bg-white px-4 py-3 rounded shadow-sm">
        //                   <div className="font-medium text-gray-900">{item.name}</div>
        //                   <div className="text-gray-600 text-sm mt-1 item-explanation">{item.explanation}</div>
        //                 </div>
        //               ))}
        //               {tier.items.length === 0 && (
        //                 <div className="w-full h-12 flex items-center justify-center text-gray-400 italic">
        //                   No items in this tier
        //                 </div>
        //               )}
        //             </div>
        //           </div>
        //         </div>
        //       ))}
        //     </div>
        //   </div>
        //  </div>

  // Create a custom TierList component to render in the main view that includes delete buttons

  const EditableTierList = () => (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        <div ref={tierListRef}>
          <TierList
            data={{ ...tierListData, topic: listName }}
            onUpdateTierName={handleUpdateTierName}
            onUpdateTierColor={handleUpdateTierColor}
          />
        </div>
      </div>
  
      {/* Hidden container for export */}
      <div className="hidden">
        <div ref={exportContainerRef} className="p-8 bg-white">
          <div className="space-y-4">
            {tierListData.tiers.map((tier, index) => (
              <div key={index} className="flex">
                <div
                  className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-l-md"
                  style={{ backgroundColor: tier.color }}
                >
                  {tier.name}
                </div>
                <div className="flex-1 bg-gray-100 rounded-r-md min-h-20 p-4">
                  <div className="flex flex-wrap gap-3">
                    {tier.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-white px-4 py-3 rounded shadow-sm relative group"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border border-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteItem(index, itemIndex)}
                        >
                          <Trash2 size={14} className="text-red-500" />
                          <span className="sr-only">Delete item</span>
                        </Button>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-gray-600 text-sm mt-1 item-explanation">
                          {item.explanation}
                        </div>
                      </div>
                    ))}
  
                    {tier.items.length === 0 && (
                      <div className="w-full h-12 flex items-center justify-center text-gray-400 italic">
                        No items in this tier
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
      <Header />
      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</h1>
            <Popover open={isEditingName} onOpenChange={setIsEditingName}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit size={16} />
                  <span className="sr-only">Edit list name</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Edit List Name</h4>
                  <div className="space-y-2">
                    <Label htmlFor="list-name">List Name</Label>
                    <Input
                      id="list-name"
                      defaultValue={listName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateListName((e.target as HTMLInputElement).value)
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => {
                      const input = document.getElementById("list-name") as HTMLInputElement
                      handleUpdateListName(input.value)
                    }}>
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">AI-generated rankings based on your criteria</p>
        </div>

        {/* Main tier list container with our custom editable version */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6" ref={tierListRef}>
          <EditableTierList />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {/* Recording Dialog */}
          {/* <Dialog open={recordingDialogOpen} onOpenChange={(open) => {
            // Prevent closing dialog while recording
            if (isRecording && !open) {
              toast({
                title: "Recording in progress",
                description: "Please stop recording before closing this dialog.",
              });
              return;
            }
            setRecordingDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setRecordingDialogOpen(true)}
              >
                <Video size={16} />
                Record Tier List
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" ref={animationDialogRef}>
              <DialogHeader>
                <DialogTitle className="flex items-center w-full justify-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</span>
                  {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}
                </DialogTitle>
              </DialogHeader>
              <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        <div ref={tierListRef}>
          <TierList
          animation
            data={{ ...tierListData, topic: listName }}
            onUpdateTierName={handleUpdateTierName}
            onUpdateTierColor={handleUpdateTierColor}
          />
        </div>
      </div> */}
  
      {/* Hidden container for export */}
      {/* <div className="hidden">
        <div ref={exportContainerRef} className="p-8 bg-white">
          <div className="space-y-4">
            {tierListData.tiers.map((tier, index) => (
              <div key={index} className="flex">
                <div
                  className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-l-md"
                  style={{ backgroundColor: tier.color }}
                >
                  {tier.name}
                </div>
                <div className="flex-1 bg-gray-100 rounded-r-md min-h-20 p-4">
                  <div className="flex flex-wrap gap-3">
                    {tier.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="bg-white px-4 py-3 rounded shadow-sm relative group"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white border border-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteItem(index, itemIndex)}
                        >
                          <Trash2 size={14} className="text-red-500" />
                          <span className="sr-only">Delete item</span>
                        </Button>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-gray-600 text-sm mt-1 item-explanation">
                          {item.explanation}
                        </div>
                      </div>
                    ))}
  
                    {tier.items.length === 0 && (
                      <div className="w-full h-12 flex items-center justify-center text-gray-400 italic">
                        No items in this tier
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
            </DialogContent>
          </Dialog> */}

          {/* Export dialog */}
          {/* <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download size={16} />
                Download as Image
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Options</DialogTitle>
                <DialogDescription>Choose how you want your tier list to appear in the image</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-explanations"
                    checked={includeExplanations}
                    onCheckedChange={(checked) => setIncludeExplanations(!!checked)}
                  />
                  <Label htmlFor="include-explanations">Include explanations for each item</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowExportDialog(false)
                    handleDownloadAsImage()
                  }}
                >
                  Download
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog> */}

          {/* Previous list dialog */}
          {/* {previousTierList && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <History size={16} />
                  View Previous List
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Previous Tier List</DialogTitle>
                  <DialogDescription>This was your tier list before regeneration</DialogDescription>
                </DialogHeader>
                <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
                  <TierList
                    data={previousTierList}
                    onUpdateTierName={() => {}} // Read-only
                    onUpdateTierColor={() => {}} // Read-only
                  />
                </div>
              </DialogContent>
            </Dialog>
          )} */}

          {/* Regenerate button */}
          <Button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb]"
          >
            <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
            {isRegenerating ? "Regenerating..." : "Create New Tier List"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square, Video, AlertTriangle } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import html2canvas from "html2canvas"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"
// import { fetchResult } from "@/lib/actions"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// // Define TypeScript interfaces
// interface TierItemInterface {
//   name: string;
//   explanation: string;
// }

// interface TierInterface {
//   name: string;
//   color: string;
//   items: TierItemInterface[];
// }

// interface TierListDataInterface {
//   topic: string;
//   tiers: TierInterface[];
// }

// // Empty tier list template
// const emptyTierListData: TierListDataInterface = {
//   topic: "Loading...",
//   tiers: [
//     { name: "S", color: "#FFD700", items: [] },
//     { name: "A", color: "#3b82f6", items: [] },
//     { name: "B", color: "#10B981", items: [] },
//     { name: "C", color: "#F59E0B", items: [] },
//     { name: "D", color: "#EF4444", items: [] },
//   ],
// }

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListDataInterface): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     // Silently fail
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListDataInterface | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     return null
//   }
// }

// // Function to check supported MIME types for recording
// const getSupportedMimeType = (): string => {
//   const possibleTypes = [
//     'video/webm;codecs=vp9',
//     'video/webm;codecs=vp8',
//     'video/webm',
//     'video/mp4'
//   ];
  
//   for (const type of possibleTypes) {
//     if (MediaRecorder.isTypeSupported(type)) {
//       return type;
//     }
//   }
  
//   return ''; // No supported types found
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState<TierListDataInterface>(emptyTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>("Loading...")
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [recordingTime, setRecordingTime] = useState<number>(0)
//   const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
//   const [frameRate, setFrameRate] = useState<number>(30) // Default frame rate
//   const [recordingDialogOpen, setRecordingDialogOpen] = useState<boolean>(false)
//   const [loading, setLoading] = useState<boolean>(true)
//   const [error, setError] = useState<string | null>(null)

//   const tierListRef = useRef<HTMLDivElement>(null)
//   const exportContainerRef = useRef<HTMLDivElement>(null)
//   const recordingRef = useRef<HTMLCanvasElement | null>(null)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const recordedChunksRef = useRef<Blob[]>([])
//   const streamRef = useRef<MediaStream | null>(null)
//   const animationFrameRef = useRef<number | null>(null)
//   const animationDialogRef = useRef<HTMLDivElement>(null)
//   const { toast } = useToast()
//   const router = useRouter()
  

//   const getResults = async () => {
//     try {
//       // setLoading(true)
//       // setError(null)
//       console.log("Starting")
      
//       // Get data from localStorage
//       const rawData = localStorage.getItem("TierList")
      
//       if (!rawData) {
//         setError("No tier list found in localStorage");
//         return null;
//       }
      
//       let jsonContent: TierListDataInterface | null = null;
      
//       try {
//         // First parse the raw data from localStorage
//         const parsedData = JSON.parse(rawData);
        
//         // Check if the data has a content property that's a string
//         if (parsedData.content && typeof parsedData.content === 'string') {
//           // Parse the nested JSON string
//           jsonContent = JSON.parse(parsedData.content);
//         } else {
//           // If it's already an object, use it directly
//           jsonContent = parsedData;
//         }
        
//         // Validate the tier list data structure
//         if (jsonContent && jsonContent.topic && jsonContent.tiers) {
//           setTierListData(jsonContent);
//           setListName(jsonContent.topic);
//           return jsonContent;
//         } else {
//           throw new Error("Invalid tier list data format");
//         }
//       } catch (parseError) {
//         console.error("Parse error:", parseError);
//         setError("Failed to parse the tier list data. Please try again.");
//         throw parseError;
//       }
//     } catch (err) {
//       console.error("Error in getResults:", err);
//       setError('An unexpected error occurred while loading your tier list');
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Fetch tier list data from server
//   useEffect(() => {
//     getResults();
//   }, []);

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   // Cleanup function for recording
//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop())
//       }
      
//       if (recordingTimer) {
//         clearInterval(recordingTimer)
//       }
      
//       if (animationFrameRef.current) {
//         cancelAnimationFrame(animationFrameRef.current)
//       }
//     }
//   }, [recordingTimer])

//   // Handle dialog close - stop recording if dialog closes
//   useEffect(() => {
//     if (!recordingDialogOpen && isRecording) {
//       stopRecording()
//     }
//   }, [recordingDialogOpen])

//   const handleUpdateTierName = (tierIndex: number, newName: string): void => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].name = newName
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleUpdateTierColor = (tierIndex: number, newColor: string): void => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].color = newColor
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleRegenerate = (): void => {
//     setIsRegenerating(true)

//     // Save current tier list before regenerating
//     saveTierListToStorage(tierListData)
//     setPreviousTierList(tierListData)

//     // Redirect to form page to generate a new tier list
//     router.push('/create')
    
//     toast({
//       title: "Generating new tier list",
//       description: "Please enter your criteria for a new tier list.",
//     })
//   }

//   const handleDownloadAsImage = async (): Promise<void> => {
//     if (!exportContainerRef.current) return

//     try {
//       toast({
//         title: "Preparing download",
//         description: "Your tier list image is being generated...",
//       })

//       // Create a temporary container for the export
//       const exportContainer = document.createElement("div")
//       exportContainer.style.position = "absolute"
//       exportContainer.style.left = "-9999px"
//       exportContainer.style.top = "-9999px"
//       exportContainer.style.width = "1920px" // Base width for 4K scaling
//       exportContainer.style.padding = "40px"
//       exportContainer.style.backgroundColor = "white"
//       document.body.appendChild(exportContainer)

//       // Clone the tier list for export
//       const tierListClone = exportContainerRef.current.cloneNode(true) as HTMLElement

//       // Remove any buttons, tooltips, or interactive elements
//       const buttonsToRemove = tierListClone.querySelectorAll('button, [role="button"]')
//       buttonsToRemove.forEach((button: Element) => button.remove())

//       // Add title
//       const titleElement = document.createElement("h1")
//       titleElement.textContent = `${listName} Tier List`
//       titleElement.style.fontSize = "48px"
//       titleElement.style.fontWeight = "bold"
//       titleElement.style.marginBottom = "24px"
//       titleElement.style.textAlign = "center"
//       titleElement.style.color = "#1e1e1e"

//       // Add watermark
//       const watermarkElement = document.createElement("div")
//       watermarkElement.textContent = "Tier Gods"
//       watermarkElement.style.position = "absolute"
//       watermarkElement.style.bottom = "20px"
//       watermarkElement.style.right = "20px"
//       watermarkElement.style.fontSize = "24px"
//       watermarkElement.style.opacity = "0.3"
//       watermarkElement.style.fontWeight = "bold"
//       watermarkElement.style.color = "#1e1e1e"

//       // Add elements to export container
//       exportContainer.appendChild(titleElement)
//       exportContainer.appendChild(tierListClone)
//       exportContainer.appendChild(watermarkElement)

//       // If not including explanations, hide them
//       if (!includeExplanations) {
//         const explanations = exportContainer.querySelectorAll(".item-explanation")
//         explanations.forEach((explanation) => {
//           (explanation as HTMLElement).style.display = "none"
//         })
//       }

//       // Generate high-resolution image
//       const canvas = await html2canvas(exportContainer, {
//         backgroundColor: "#ffffff",
//         scale: 2, // Higher quality
//         width: 1920, // Base width for 4K
//         height: exportContainer.offsetHeight,
//         logging: false,
//       })

//       // Clean up
//       document.body.removeChild(exportContainer)

//       // Download the image
//       const image = canvas.toDataURL("image/png")
//       const link = document.createElement("a")
//       link.href = image
//       link.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list.png`
//       link.click()

//       toast({
//         title: "Download complete",
//         description: "Your tier list image has been downloaded.",
//       })
//     } catch (error) {
//       toast({
//         title: "Download failed",
//         description: "There was an error generating your tier list image.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleUpdateListName = (newName: string): void => {
//     if (newName.trim()) {
//       setListName(newName.trim())
//       setIsEditingName(false)
//     }
//   }

//   const renderFrame = (): void => {
//     if (!isRecording || !recordingRef.current || !animationDialogRef.current) return
    
//     const canvas = recordingRef.current
//     const ctx = canvas.getContext('2d')
//     if (!ctx) return
    
//     // Clear the canvas
//     ctx.fillStyle = '#ffffff'
//     ctx.fillRect(0, 0, canvas.width, canvas.height)
    
//     // Draw the tier list dialog at high resolution
//     html2canvas(animationDialogRef.current, {
//       backgroundColor: '#ffffff',
//       scale: 2,
//       logging: false,
//       allowTaint: true,
//       useCORS: true
//     }).then(dialogCanvas => {
//       // Center the dialog in the 4K canvas
//       const scaleRatio = Math.min(
//         canvas.width / dialogCanvas.width, 
//         canvas.height / dialogCanvas.height
//       ) * 0.9 // Leave some margin
      
//       const scaledWidth = dialogCanvas.width * scaleRatio
//       const scaledHeight = dialogCanvas.height * scaleRatio
//       const x = (canvas.width - scaledWidth) / 2
//       const y = (canvas.height - scaledHeight) / 2
      
//       ctx.drawImage(
//         dialogCanvas, 
//         0, 0, dialogCanvas.width, dialogCanvas.height,
//         x, y, scaledWidth, scaledHeight
//       )
      
//       // Continue rendering if still recording
//       if (isRecording) {
//         animationFrameRef.current = requestAnimationFrame(renderFrame)
//       }
//     }).catch(() => {
//       // Continue trying to render if still recording
//       if (isRecording) {
//         animationFrameRef.current = requestAnimationFrame(renderFrame)
//       }
//     })
//   }

//   const stopRecording = (): void => {
//     // Stop the media recorder first to trigger ondataavailable and onstop events
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       try {
//         mediaRecorderRef.current.stop()
//       } catch (e) {
//         // Ignore errors when stopping recorder
//       }
//     }
    
//     // Stop all tracks in the stream
//     if (streamRef.current) {
//       try {
//         streamRef.current.getTracks().forEach(track => track.stop())
//         streamRef.current = null
//       } catch (e) {
//         // Ignore errors when stopping stream
//       }
//     }
    
//     // Clear the interval timer
//     if (recordingTimer) {
//       clearInterval(recordingTimer)
//       setRecordingTimer(null)
//     }
    
//     // Cancel animation frame
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current)
//       animationFrameRef.current = null
//     }
    
//     // Reset recording state
//     setIsRecording(false)
//     setRecordingTime(0)
//   }

//   // Format seconds into MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
//     const secs = (seconds % 60).toString().padStart(2, '0')
//     return `${mins}:${secs}`
//   }

//   // Show loading state
//   if (loading) {
//     return (
//       <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
//         <Header />
//         <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//             <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading your tier list...</h2>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     )
//   }

//   // Show error state
//   if (error) {
//     return (
//       <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
//         <Header />
//         <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
//           <Alert variant="destructive" className="mb-6">
//             <AlertTriangle className="h-4 w-4" />
//             <AlertTitle>Error</AlertTitle>
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
          
//           <div className="text-center mt-8">
//             <Button onClick={() => router.push('/')}>
//               Create New Tier List
//             </Button>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     )
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
//       <Header />
//       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
//         <div className="mb-8 text-center flex flex-col items-center">
//           <div className="flex items-center justify-center gap-2 mb-2">
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</h1>
//             <Popover open={isEditingName} onOpenChange={setIsEditingName}>
//               <PopoverTrigger asChild>
//                 <Button variant="ghost" size="icon" className="h-8 w-8">
//                   <Edit size={16} />
//                   <span className="sr-only">Edit list name</span>
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-80">
//                 <div className="space-y-4">
//                   <h4 className="font-medium text-sm">Edit List Name</h4>
//                   <div className="space-y-2">
//                     <Label htmlFor="list-name">List Name</Label>
//                     <Input
//                       id="list-name"
//                       defaultValue={listName}
//                       onKeyDown={(e) => {
//                         if (e.key === "Enter") {
//                           handleUpdateListName((e.target as HTMLInputElement).value)
//                         }
//                       }}
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <Button onClick={() => {
//                       const input = document.getElementById("list-name") as HTMLInputElement
//                       handleUpdateListName(input.value)
//                     }}>
//                       Save
//                     </Button>
//                   </div>
//                 </div>
//               </PopoverContent>
//             </Popover>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">AI-generated rankings based on your criteria</p>
//         </div>

//         {/* Main tier list container */}
//         <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
//           <div ref={tierListRef}>
//             <TierList
//               data={{ ...tierListData, topic: listName }}
//               onUpdateTierName={handleUpdateTierName}
//               onUpdateTierColor={handleUpdateTierColor}
//             />
//           </div>
//         </div>

//         {/* Hidden container for export */}
//         <div className="hidden">
//           <div ref={exportContainerRef} className="p-8 bg-white">
//             <div className="space-y-4">
//               {tierListData.tiers.map((tier, index) => (
//                 <div key={index} className="flex">
//                   <div
//                     className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-l-md"
//                     style={{ backgroundColor: tier.color }}
//                   >
//                     {tier.name}
//                   </div>
//                   <div className="flex-1 bg-gray-100 rounded-r-md min-h-20 p-4">
//                     <div className="flex flex-wrap gap-3">
//                       {tier.items.map((item, itemIndex) => (
//                         <div key={itemIndex} className="bg-white px-4 py-3 rounded shadow-sm">
//                           <div className="font-medium text-gray-900">{item.name}</div>
//                           <div className="text-gray-600 text-sm mt-1 item-explanation">{item.explanation}</div>
//                         </div>
//                       ))}
//                       {tier.items.length === 0 && (
//                         <div className="w-full h-12 flex items-center justify-center text-gray-400 italic">
//                           No items in this tier
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-wrap justify-center gap-4 mt-8">
//           {/* Recording Dialog */}
//           <Dialog open={recordingDialogOpen} onOpenChange={(open) => {
//             // Prevent closing dialog while recording
//             if (isRecording && !open) {
//               toast({
//                 title: "Recording in progress",
//                 description: "Please stop recording before closing this dialog.",
//               });
//               return;
//             }
//             setRecordingDialogOpen(open);
//           }}>
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="flex items-center gap-2"
//                 onClick={() => setRecordingDialogOpen(true)}
//               >
//                 <Video size={16} />
//                 Record Tier List
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" ref={animationDialogRef}>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center w-full justify-center">
//                   <span className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</span>
//                   {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}
//                 </DialogTitle>
//               </DialogHeader>
//               <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                 <TierList
//                   animation
//                   data={{ ...tierListData, topic: listName }}
//                   onUpdateTierName={isRecording ? () => {} : handleUpdateTierName}
//                   onUpdateTierColor={isRecording ? () => {} : handleUpdateTierColor}
//                 />
//                 <div className="mt-4 flex justify-end items-center gap-2">
//                  {/* </div> {!isRecording ? (
//                     // <Button
//                     //   variant="default"
//                     //   onClick={startRecording}
//                     //   className="bg-red-600 hover:bg-red-700"
//                     // >
//                     //   <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
//                     //   Start Recording
//                     // </Button>
//                   // ) : (
//                     // <Button
//                     //   variant="default"
//                     //   onClick={stopRecording}
//                     //   className="bg-red-600 hover:bg-red-700"
//                     // >
//                     //   <Square className="mr-2 h-4 w-4" />
//                     //   Stop Recording
//                     // </Button>
//                   // )}
//                 </div> */}
//                 </div>
//               </div>
//               {/* {isRecording && (
//                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
//                   <p className="font-medium">Recording in progress</p>
//                   <p>Feel free to interact with your tier list while recording. When finished, click "Stop Recording" to save the video.</p>
//                 </div>
//               )} */}
//             </DialogContent>
//           </Dialog>

//           {/* Export dialog */}
//           <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="flex items-center gap-2">
//                 <Download size={16} />
//                 Download as Image
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Download Options</DialogTitle>
//                 <DialogDescription>Choose how you want your tier list to appear in the image</DialogDescription>
//               </DialogHeader>
//               <div className="py-4">
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="include-explanations"
//                     checked={includeExplanations}
//                     onCheckedChange={(checked) => setIncludeExplanations(!!checked)}
//                   />
//                   <Label htmlFor="include-explanations">Include explanations for each item</Label>
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button
//                   onClick={() => {
//                     setShowExportDialog(false)
//                     handleDownloadAsImage()
//                   }}
//                 >
//                   Download
//                 </Button>
//               </DialogFooter>
//             </DialogContent>
//           </Dialog>

//           {/* Previous list dialog */}
//           {previousTierList && (
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button variant="outline" className="flex items-center gap-2">
//                   <History size={16} />
//                   View Previous List
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Previous Tier List</DialogTitle>
//                   <DialogDescription>This was your tier list before regeneration</DialogDescription>
//                 </DialogHeader>
//                 <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                   <TierList
//                     data={previousTierList}
//                     onUpdateTierName={() => {}} // Read-only
//                     onUpdateTierColor={() => {}} // Read-only
//                   />
//                 </div>
//               </DialogContent>
//             </Dialog>
//           )}

//           {/* Regenerate button */}
//           <Button
//             onClick={handleRegenerate}
//             disabled={isRegenerating}
//             className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb]"
//           >
//             <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
//             {isRegenerating ? "Regenerating..." : "Create New Tier List"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }

// // "use client"

// // import { useState, useRef, useEffect } from "react"
// // import { useRouter } from "next/navigation"
// // import Header from "@/components/header"
// // import Footer from "@/components/footer"
// // import TierList, { TierItem } from "@/components/tier-list"
// // import { Button } from "@/components/ui/button"
// // import { Download, RefreshCw, History, Edit, Play, Square, Video } from "lucide-react"
// // import { useToast } from "@/hooks/use-toast"
// // import html2canvas from "html2canvas"
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogTrigger,
// //   DialogFooter,
// // } from "@/components/ui/dialog"
// // import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// // import { Input } from "@/components/ui/input"
// // import { Label } from "@/components/ui/label"
// // import { Checkbox } from "@/components/ui/checkbox"
// // import { fetchResult } from "@/lib/actions"

// // // Define TypeScript interfaces
// // interface TierItemInterface {
// //   name: string;
// //   explanation: string;
// // }

// // interface TierInterface {
// //   name: string;
// //   color: string;
// //   items: TierItemInterface[];
// // }

// // interface TierListDataInterface {
// //   topic: string;
// //   tiers: TierInterface[];
// // }

// // // Mock data for the tier list
// // const mockTierListData: TierListDataInterface = {
// //   topic: "Fast Food Chains",
// //   tiers: [
// //     {
// //       name: "S",
// //       color: "#FFD700",
// //       items: [
// //         {
// //           name: "In-N-Out",
// //           explanation: "High quality and great value, consistently ranked best by consumers.",
// //         },
// //       ],
// //     },
// //     {
// //       name: "A",
// //       color: "#3b82f6",
// //       items: [
// //         {
// //           name: "Five Guys",
// //           explanation: "Premium quality but higher price point. Great customization options.",
// //         },
// //         {
// //           name: "Chick-fil-A",
// //           explanation: "Excellent customer service and consistent quality across locations.",
// //         },
// //       ],
// //     },
// //     {
// //       name: "B",
// //       color: "#10B981",
// //       items: [
// //         {
// //           name: "Shake Shack",
// //           explanation: "Good quality but limited availability and higher prices.",
// //         },
// //         {
// //           name: "Wendy's",
// //           explanation: "Better quality than most fast food, with fresh ingredients.",
// //         },
// //       ],
// //     },
// //     {
// //       name: "C",
// //       color: "#F59E0B",
// //       items: [
// //         {
// //           name: "McDonald's",
// //           explanation: "Consistent but average quality. Convenient and affordable.",
// //         },
// //         {
// //           name: "Burger King",
// //           explanation: "Decent options but inconsistent quality across locations.",
// //         },
// //       ],
// //     },
// //     {
// //       name: "D",
// //       color: "#EF4444",
// //       items: [
// //         {
// //           name: "Jack in the Box",
// //           explanation: "Lower quality ingredients and preparation.",
// //         },
// //       ],
// //     },
// //   ],
// // }

// // // Function to save tier list to localStorage
// // const saveTierListToStorage = (tierList: TierListDataInterface): void => {
// //   try {
// //     localStorage.setItem("previousTierList", JSON.stringify(tierList))
// //   } catch (error) {
// //     // console.error("Error saving tier list to localStorage:", error)
// //   }
// // }

// // // Function to get tier list from localStorage
// // const getPreviousTierList = (): TierListDataInterface | null => {
// //   try {
// //     const savedTierList = localStorage.getItem("previousTierList")
// //     return savedTierList ? JSON.parse(savedTierList) : null
// //   } catch (error) {
// //     // console.error("Error retrieving tier list from localStorage:", error)
// //     return null
// //   }
// // }

// // // Function to check supported MIME types for recording
// // const getSupportedMimeType = (): string => {
// //   const possibleTypes = [
// //     'video/webm;codecs=vp9',
// //     'video/webm;codecs=vp8',
// //     'video/webm',
// //     'video/mp4'
// //   ];
  
// //   for (const type of possibleTypes) {
// //     if (MediaRecorder.isTypeSupported(type)) {
// //       return type;
// //     }
// //   }
  
// //   return ''; // No supported types found
// // }

// // export default function ResultsPage() {
// //   const [tierListData, setTierListData] = useState<TierListDataInterface>(mockTierListData)
// //   const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
// //   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
// //   const [listName, setListName] = useState<string>(mockTierListData.topic)
// //   const [isEditingName, setIsEditingName] = useState<boolean>(false)
// //   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
// //   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
// //   const [isRecording, setIsRecording] = useState<boolean>(false)
// //   const [recordingTime, setRecordingTime] = useState<number>(0)
// //   const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
// //   const [frameRate, setFrameRate] = useState<number>(30) // Default frame rate
// //   const [recordingDialogOpen, setRecordingDialogOpen] = useState<boolean>(false)

// //   const tierListRef = useRef<HTMLDivElement>(null)
// //   const exportContainerRef = useRef<HTMLDivElement>(null)
// //   const recordingRef = useRef<HTMLCanvasElement | null>(null)
// //   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
// //   const recordedChunksRef = useRef<Blob[]>([])
// //   const streamRef = useRef<MediaStream | null>(null)
// //   const animationFrameRef = useRef<number | null>(null)
// //   const animationDialogRef = useRef<HTMLDivElement>(null)
// //   const { toast } = useToast()
// //   const router = useRouter()


// //   useEffect(() => {
// //     async function getResults() {
// //       try {
// //         const data = await fetchResult();
// //         if (data.success && data.data) {
// //           console.log(data.data.content, "Contents")
// //           // Store raw data for debugging
// //           // setRawData(data.data.content);
          
// //           // Try to parse the content as JSON
// //           try {
// //             let jsonContent: any;
            
// //             if (typeof data.data.content === 'string') {
// //               // Try to find JSON within the content
// //               const jsonMatch = data.data.content.match(/\{[\s\S]*\}/);
// //               if (jsonMatch) {
// //                 jsonContent = JSON.parse(jsonMatch[0]);
// //               } else {
// //                 throw new Error("Could not extract JSON from response");
// //               }
// //             } else {
// //               jsonContent = data.data.content as unknown;
// //             }

// //             console.log(jsonContent, "Json Content")
            
// //             } catch (parseError) {
// //             console.error("Failed to parse tier list JSON:", parseError);
// //             // setError("Failed to parse the generated tier list");
// //           }
// //         } else {
// //           // setError(data.error || 'Failed to fetch tier list');
// //           // Redirect back to form after delay if no results found
// //           setTimeout(() => router.push('/'), 3000);
// //         }
// //       } catch (err) {
// //         // setError('An unexpected error occurred');
// //         console.error(err);
// //       } finally {
// //         // setLoading(false);
// //       }
// //     }

// //     getResults();
// //   }, [router]);




// //   // Load previous tier list from localStorage on component mount
// //   useEffect(() => {
// //     const savedTierList = getPreviousTierList()
// //     if (savedTierList) {
// //       setPreviousTierList(savedTierList)
// //     }
// //   }, [])

// //   // Cleanup function for recording
// //   useEffect(() => {
// //     return () => {
// //       if (streamRef.current) {
// //         streamRef.current.getTracks().forEach(track => track.stop())
// //       }
      
// //       if (recordingTimer) {
// //         clearInterval(recordingTimer)
// //       }
      
// //       if (animationFrameRef.current) {
// //         cancelAnimationFrame(animationFrameRef.current)
// //       }
// //     }
// //   }, [recordingTimer])

// //   // Handle dialog close - stop recording if dialog closes
// //   useEffect(() => {
// //     if (!recordingDialogOpen && isRecording) {
// //       stopRecording()
// //     }
// //   }, [recordingDialogOpen])

// //   const handleUpdateTierName = (tierIndex: number, newName: string): void => {
// //     const newTiers = [...tierListData.tiers]
// //     newTiers[tierIndex].name = newName
// //     setTierListData({
// //       ...tierListData,
// //       tiers: newTiers,
// //     })
// //   }

// //   const handleUpdateTierColor = (tierIndex: number, newColor: string): void => {
// //     const newTiers = [...tierListData.tiers]
// //     newTiers[tierIndex].color = newColor
// //     setTierListData({
// //       ...tierListData,
// //       tiers: newTiers,
// //     })
// //   }

// //   const handleRegenerate = (): void => {
// //     setIsRegenerating(true)

// //     // Save current tier list before regenerating
// //     saveTierListToStorage(tierListData)
// //     setPreviousTierList(tierListData)

// //     // Simulate API call
// //     setTimeout(() => {
// //       setIsRegenerating(false)
// //       // Reset to a new tier list (in a real app, this would fetch new data)
// //       setTierListData(JSON.parse(JSON.stringify(mockTierListData)))
// //       setListName(mockTierListData.topic)

// //       toast({
// //         title: "Tier list regenerated",
// //         description: "Your tier list has been updated with new rankings.",
// //       })
// //     }, 1500)
// //   }

// //   const handleDownloadAsImage = async (): Promise<void> => {
// //     if (!exportContainerRef.current) return

// //     try {
// //       toast({
// //         title: "Preparing download",
// //         description: "Your tier list image is being generated...",
// //       })

// //       // Create a temporary container for the export
// //       const exportContainer = document.createElement("div")
// //       exportContainer.style.position = "absolute"
// //       exportContainer.style.left = "-9999px"
// //       exportContainer.style.top = "-9999px"
// //       exportContainer.style.width = "1920px" // Base width for 4K scaling
// //       exportContainer.style.padding = "40px"
// //       exportContainer.style.backgroundColor = "white"
// //       document.body.appendChild(exportContainer)

// //       // Clone the tier list for export
// //       const tierListClone = exportContainerRef.current.cloneNode(true) as HTMLElement

// //       // Remove any buttons, tooltips, or interactive elements
// //       const buttonsToRemove = tierListClone.querySelectorAll('button, [role="button"]')
// //       buttonsToRemove.forEach((button: Element) => button.remove())

// //       // Add title
// //       const titleElement = document.createElement("h1")
// //       titleElement.textContent = `${listName} Tier List`
// //       titleElement.style.fontSize = "48px"
// //       titleElement.style.fontWeight = "bold"
// //       titleElement.style.marginBottom = "24px"
// //       titleElement.style.textAlign = "center"
// //       titleElement.style.color = "#1e1e1e"

// //       // Add watermark
// //       const watermarkElement = document.createElement("div")
// //       watermarkElement.textContent = "Tier Gods"
// //       watermarkElement.style.position = "absolute"
// //       watermarkElement.style.bottom = "20px"
// //       watermarkElement.style.right = "20px"
// //       watermarkElement.style.fontSize = "24px"
// //       watermarkElement.style.opacity = "0.3"
// //       watermarkElement.style.fontWeight = "bold"
// //       watermarkElement.style.color = "#1e1e1e"

// //       // Add elements to export container
// //       exportContainer.appendChild(titleElement)
// //       exportContainer.appendChild(tierListClone)
// //       exportContainer.appendChild(watermarkElement)

// //       // If not including explanations, hide them
// //       if (!includeExplanations) {
// //         const explanations = exportContainer.querySelectorAll(".item-explanation")
// //         explanations.forEach((explanation) => {
// //           (explanation as HTMLElement).style.display = "none"
// //         })
// //       }

// //       // Generate high-resolution image
// //       const canvas = await html2canvas(exportContainer, {
// //         backgroundColor: "#ffffff",
// //         scale: 2, // Higher quality
// //         width: 1920, // Base width for 4K
// //         height: exportContainer.offsetHeight,
// //         logging: false,
// //       })

// //       // Clean up
// //       document.body.removeChild(exportContainer)

// //       // Download the image
// //       const image = canvas.toDataURL("image/png")
// //       const link = document.createElement("a")
// //       link.href = image
// //       link.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list.png`
// //       link.click()

// //       toast({
// //         title: "Download complete",
// //         description: "Your tier list image has been downloaded.",
// //       })
// //     } catch (error) {
// //       // console.error("Error generating image:", error)
// //       toast({
// //         title: "Download failed",
// //         description: "There was an error generating your tier list image.",
// //         variant: "destructive",
// //       })
// //     }
// //   }

// //   const handleUpdateListName = (newName: string): void => {
// //     if (newName.trim()) {
// //       setListName(newName.trim())
// //       setIsEditingName(false)
// //     }
// //   }

// //   // Screen recording functions
// //   const startRecording = async (): Promise<void> => {
// //     try {
// //       if (!animationDialogRef.current) {
// //         toast({
// //           title: "Recording error",
// //           description: "Could not find the dialog content to record.",
// //           variant: "destructive",
// //         })
// //         return
// //       }

// //       // Reset recording state
// //       recordedChunksRef.current = []
      
// //       // Create a canvas for recording at 4K resolution
// //       const recordingCanvas = document.createElement('canvas')
// //       const ctx = recordingCanvas.getContext('2d')
      
// //       // Set canvas to 4K dimensions (3840x2160)
// //       recordingCanvas.width = 3840
// //       recordingCanvas.height = 2160
// //       recordingRef.current = recordingCanvas
      
// //       // Create a media stream from the canvas
// //       const stream = recordingCanvas.captureStream(frameRate)
// //       streamRef.current = stream
      
// //       // Get supported MIME type
// //       const mimeType = getSupportedMimeType()
// //       if (!mimeType) {
// //         throw new Error("No supported video recording format found in this browser")
// //       }
      
// //       // Setup media recorder with best available settings
// //       const recorderOptions: MediaRecorderOptions = {
// //         mimeType: mimeType
// //       }
      
// //       // Add bitrate if supported (not all browsers support this option)
// //       try {
// //         recorderOptions.videoBitsPerSecond = 8000000 // 8 Mbps
// //       } catch (e) {
// //         console.warn("VideoBitsPerSecond not supported in this browser")
// //       }
      
// //       const recorder = new MediaRecorder(stream, recorderOptions)
// //       mediaRecorderRef.current = recorder
      
// //       recorder.ondataavailable = (e) => {
// //         if (e.data && e.data.size > 0) {
// //           recordedChunksRef.current.push(e.data)
// //         }
// //       }
      
// //       recorder.onstop = () => {
// //         // Only create download if we have chunks
// //         if (recordedChunksRef.current.length === 0) {
// //           toast({
// //             title: "Recording failed",
// //             description: "No video data was captured during recording.",
// //             variant: "destructive",
// //           })
// //           return
// //         }
        
// //         // Determine the best file extension based on MIME type
// //         let fileExtension = 'webm'
// //         if (mimeType.includes('mp4')) {
// //           fileExtension = 'mp4'
// //         }
        
// //         const blob = new Blob(recordedChunksRef.current, { type: mimeType })
        
// //         // Create download link
// //         const url = URL.createObjectURL(blob)
// //         const a = document.createElement('a')
// //         a.href = url
// //         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-recording.${fileExtension}`
// //         document.body.appendChild(a)
// //         a.click()
        
// //         // Clean up
// //         setTimeout(() => {
// //           document.body.removeChild(a)
// //           URL.revokeObjectURL(url)
// //         }, 100)
        
// //         toast({
// //           title: "Recording saved",
// //           description: `Your tier list recording has been downloaded as ${fileExtension.toUpperCase()} format.`,
// //         })
// //       }
      
// //       // Start the recorder with chunks collected every second
// //       recorder.start(1000)
// //       setIsRecording(true)
      
// //       // Start a timer to show recording duration
// //       const timer = setInterval(() => {
// //         setRecordingTime(prev => prev + 1)
// //       }, 1000)
// //       setRecordingTimer(timer)
      
// //       // Start the render loop
// //       renderFrame()

// //       toast({
// //         title: "Recording started",
// //         description: `Your tier list is now being recorded in high quality at ${frameRate}fps.`,
// //       })
// //     } catch (error: any) {
// //       // console.error("Error starting recording:", error)
// //       toast({
// //         title: "Recording failed",
// //         description: `Failed to start recording: ${error.message}`,
// //         variant: "destructive",
// //       })
// //       setIsRecording(false)
// //       stopRecording() // Clean up any partial setup
// //     }
// //   }

// //   const renderFrame = (): void => {
// //     if (!isRecording || !recordingRef.current || !animationDialogRef.current) return
    
// //     const canvas = recordingRef.current
// //     const ctx = canvas.getContext('2d')
// //     if (!ctx) return
    
// //     // Clear the canvas
// //     ctx.fillStyle = '#ffffff'
// //     ctx.fillRect(0, 0, canvas.width, canvas.height)
    
// //     // Draw the tier list dialog at high resolution
// //     html2canvas(animationDialogRef.current, {
// //       backgroundColor: '#ffffff',
// //       scale: 2,
// //       logging: false,
// //       allowTaint: true,
// //       useCORS: true
// //     }).then(dialogCanvas => {
// //       // Center the dialog in the 4K canvas
// //       const scaleRatio = Math.min(
// //         canvas.width / dialogCanvas.width, 
// //         canvas.height / dialogCanvas.height
// //       ) * 0.9 // Leave some margin
      
// //       const scaledWidth = dialogCanvas.width * scaleRatio
// //       const scaledHeight = dialogCanvas.height * scaleRatio
// //       const x = (canvas.width - scaledWidth) / 2
// //       const y = (canvas.height - scaledHeight) / 2
      
// //       ctx.drawImage(
// //         dialogCanvas, 
// //         0, 0, dialogCanvas.width, dialogCanvas.height,
// //         x, y, scaledWidth, scaledHeight
// //       )
      
// //       // Continue rendering if still recording
// //       if (isRecording) {
// //         animationFrameRef.current = requestAnimationFrame(renderFrame)
// //       }
// //     }).catch(err => {
// //       // console.error("Error rendering frame:", err)
// //       // Continue trying to render if still recording
// //       if (isRecording) {
// //         animationFrameRef.current = requestAnimationFrame(renderFrame)
// //       }
// //     })
// //   }

// //   const stopRecording = (): void => {
// //     // Stop the media recorder first to trigger ondataavailable and onstop events
// //     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
// //       try {
// //         mediaRecorderRef.current.stop()
// //       } catch (e) {
// //         // console.error("Error stopping media recorder:", e)
// //       }
// //     }
    
// //     // Stop all tracks in the stream
// //     if (streamRef.current) {
// //       try {
// //         streamRef.current.getTracks().forEach(track => track.stop())
// //         streamRef.current = null
// //       } catch (e) {
// //         // console.error("Error stopping stream tracks:", e)
// //       }
// //     }
    
// //     // Clear the interval timer
// //     if (recordingTimer) {
// //       clearInterval(recordingTimer)
// //       setRecordingTimer(null)
// //     }
    
// //     // Cancel animation frame
// //     if (animationFrameRef.current) {
// //       cancelAnimationFrame(animationFrameRef.current)
// //       animationFrameRef.current = null
// //     }
    
// //     // Reset recording state
// //     setIsRecording(false)
// //     setRecordingTime(0)
// //   }

// //   // Format seconds into MM:SS
// //   const formatTime = (seconds: number): string => {
// //     const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
// //     const secs = (seconds % 60).toString().padStart(2, '0')
// //     return `${mins}:${secs}`
// //   }

// //   return (
// //     <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-gray-950">
// //       <Header />
// //       <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
// //         <div className="mb-8 text-center flex flex-col items-center">
// //           <div className="flex items-center justify-center gap-2 mb-2">
// //             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</h1>
// //             <Popover open={isEditingName} onOpenChange={setIsEditingName}>
// //               <PopoverTrigger asChild>
// //                 <Button variant="ghost" size="icon" className="h-8 w-8">
// //                   <Edit size={16} />
// //                   <span className="sr-only">Edit list name</span>
// //                 </Button>
// //               </PopoverTrigger>
// //               <PopoverContent className="w-80">
// //                 <div className="space-y-4">
// //                   <h4 className="font-medium text-sm">Edit List Name</h4>
// //                   <div className="space-y-2">
// //                     <Label htmlFor="list-name">List Name</Label>
// //                     <Input
// //                       id="list-name"
// //                       defaultValue={listName}
// //                       onKeyDown={(e) => {
// //                         if (e.key === "Enter") {
// //                           handleUpdateListName((e.target as HTMLInputElement).value)
// //                         }
// //                       }}
// //                     />
// //                   </div>
// //                   <div className="flex justify-end">
// //                     <Button onClick={() => {
// //                       const input = document.getElementById("list-name") as HTMLInputElement
// //                       handleUpdateListName(input.value)
// //                     }}>
// //                       Save
// //                     </Button>
// //                   </div>
// //                 </div>
// //               </PopoverContent>
// //             </Popover>
// //           </div>
// //           <p className="text-gray-600 dark:text-gray-400 mt-2">AI-generated rankings based on your criteria</p>
// //         </div>

// //         {/* Main tier list container */}
// //         <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
// //           <div ref={tierListRef}>
// //             <TierList
// //               data={{ ...tierListData, topic: listName }}
// //               onUpdateTierName={handleUpdateTierName}
// //               onUpdateTierColor={handleUpdateTierColor}
// //             />
// //           </div>
// //         </div>

// //         {/* Hidden container for export */}
// //         <div className="hidden">
// //           <div ref={exportContainerRef} className="p-8 bg-white">
// //             <div className="space-y-4">
// //               {tierListData.tiers.map((tier, index) => (
// //                 <div key={index} className="flex">
// //                   <div
// //                     className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-white font-bold text-2xl rounded-l-md"
// //                     style={{ backgroundColor: tier.color }}
// //                   >
// //                     {tier.name}
// //                   </div>
// //                   <div className="flex-1 bg-gray-100 rounded-r-md min-h-20 p-4">
// //                     <div className="flex flex-wrap gap-3">
// //                       {tier.items.map((item, itemIndex) => (
// //                         <div key={itemIndex} className="bg-white px-4 py-3 rounded shadow-sm">
// //                           <div className="font-medium text-gray-900">{item.name}</div>
// //                           <div className="text-gray-600 text-sm mt-1 item-explanation">{item.explanation}</div>
// //                         </div>
// //                       ))}
// //                       {tier.items.length === 0 && (
// //                         <div className="w-full h-12 flex items-center justify-center text-gray-400 italic">
// //                           No items in this tier
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         <div className="flex flex-wrap justify-center gap-4 mt-8">
// //           {/* Recording Dialog */}
// //           <Dialog open={recordingDialogOpen} onOpenChange={(open) => {
// //             // Prevent closing dialog while recording
// //             if (isRecording && !open) {
// //               toast({
// //                 title: "Recording in progress",
// //                 description: "Please stop recording before closing this dialog.",
// //               });
// //               return;
// //             }
// //             setRecordingDialogOpen(open);
// //           }}>
// //             <DialogTrigger asChild>
// //               <Button
// //                 variant="outline"
// //                 className="flex items-center gap-2"
// //                 onClick={() => setRecordingDialogOpen(true)}
// //               >
// //                 <Video size={16} />
// //                 Record Tier List
// //               </Button>
// //             </DialogTrigger>
// //             <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" ref={animationDialogRef}>
// //               <DialogHeader>
// //                 <DialogTitle className="flex items-center w-full justify-center">
// //             <span className="text-3xl font-bold text-gray-900 dark:text-white">{listName} Tier List</span>

// //                   {/* <span>Record Tier List {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}</span> */}
// //                 </DialogTitle>
// //                 <DialogDescription>
// //                   {/* {isRecording 
// //                     ? "Now recording your tier list in high resolution."
// //                     : "Record your tier list to share with others. The recording will be saved when you click Stop Recording."} */}
// //                 </DialogDescription>
// //               </DialogHeader>
// //               <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
// //                 <TierList
// //                   animation
// //                   data={{ ...tierListData, topic: listName }}
// //                   onUpdateTierName={isRecording ? () => {} : handleUpdateTierName}
// //                   onUpdateTierColor={isRecording ? () => {} : handleUpdateTierColor}
// //                 />
// //                 {/* <div className="mt-4 flex justify-end items-center gap-2">
// //                   {!isRecording ? (
// //                     <Button
// //                       variant="default"
// //                       onClick={startRecording}
// //                       className="bg-red-600 hover:bg-red-700"
// //                     >
// //                       <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
// //                       Start Recording
// //                     </Button>
// //                   ) : (
// //                     <Button
// //                       variant="default"
// //                       onClick={stopRecording}
// //                       className="bg-red-600 hover:bg-red-700"
// //                     >
// //                       <Square className="mr-2 h-4 w-4" />
// //                       Stop Recording
// //                     </Button>
// //                   )}
// //                 </div> */}
// //               </div>
// //               {isRecording && (
// //                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
// //                   <p className="font-medium">Recording in progress</p>
// //                   <p>Feel free to interact with your tier list while recording. When finished, click "Stop Recording" to save the video.</p>
// //                 </div>
// //               )}
// //             </DialogContent>
// //           </Dialog>

// //           {/* Export dialog */}
// //           <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
// //             <DialogTrigger asChild>
// //               <Button variant="outline" className="flex items-center gap-2">
// //                 <Download size={16} />
// //                 Download as Image
// //               </Button>
// //             </DialogTrigger>
// //             <DialogContent>
// //               <DialogHeader>
// //                 <DialogTitle>Download Options</DialogTitle>
// //                 <DialogDescription>Choose how you want your tier list to appear in the image</DialogDescription>
// //               </DialogHeader>
// //               <div className="py-4">
// //                 <div className="flex items-center space-x-2">
// //                   <Checkbox
// //                     id="include-explanations"
// //                     checked={includeExplanations}
// //                     onCheckedChange={(checked) => setIncludeExplanations(!!checked)}
// //                   />
// //                   <Label htmlFor="include-explanations">Include explanations for each item</Label>
// //                 </div>
// //               </div>
// //               <DialogFooter>
// //                 <Button
// //                   onClick={() => {
// //                     setShowExportDialog(false)
// //                     handleDownloadAsImage()
// //                   }}
// //                 >
// //                   Download
// //                 </Button>
// //               </DialogFooter>
// //             </DialogContent>
// //           </Dialog>

// //           {/* Previous list dialog */}
// //           {previousTierList && (
// //             <Dialog>
// //               <DialogTrigger asChild>
// //                 <Button variant="outline" className="flex items-center gap-2">
// //                   <History size={16} />
// //                   View Previous List
// //                 </Button>
// //               </DialogTrigger>
// //               <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
// //                 <DialogHeader>
// //                   <DialogTitle>Previous Tier List</DialogTitle>
// //                   <DialogDescription>This was your tier list before regeneration</DialogDescription>
// //                 </DialogHeader>
// //                 <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
// //                   <TierList
// //                     data={previousTierList}
// //                     onUpdateTierName={() => {}} // Read-only
// //                     onUpdateTierColor={() => {}} // Read-only
// //                   />
// //                 </div>
// //               </DialogContent>
// //             </Dialog>
// //           )}

// //           {/* Regenerate button */}
// //           <Button
// //             onClick={handleRegenerate}
// //             disabled={isRegenerating}
// //             className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb]"
// //           >
// //             <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
// //             {isRegenerating ? "Regenerating..." : "Regenerate"}
// //           </Button>
// //         </div>
// //       </main>
// //       <Footer />
// //     </div>
// //   )
// // }
