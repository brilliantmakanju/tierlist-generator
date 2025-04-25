
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square, Video } from "lucide-react"
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

// // Mock data for the tier list
// const mockTierListData: TierListDataInterface = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListDataInterface): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListDataInterface | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
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
//   const [tierListData, setTierListData] = useState<TierListDataInterface>(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [recordingTime, setRecordingTime] = useState<number>(0)
//   const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
//   const [frameRate, setFrameRate] = useState<number>(30) // Default frame rate

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

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData(JSON.parse(JSON.stringify(mockTierListData)))
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
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
//       console.error("Error generating image:", error)
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

//   // Screen recording functions
//   const startRecording = async (): Promise<void> => {
//     try {
//       if (!animationDialogRef.current) {
//         toast({
//           title: "Recording error",
//           description: "Could not find the dialog content to record.",
//           variant: "destructive",
//         })
//         return
//       }

//       // Create a canvas for recording at 4K resolution
//       const recordingCanvas = document.createElement('canvas')
//       const ctx = recordingCanvas.getContext('2d')
      
//       // Set canvas to 4K dimensions (3840x2160)
//       recordingCanvas.width = 3840
//       recordingCanvas.height = 2160
//       recordingRef.current = recordingCanvas
      
//       // Create a media stream from the canvas
//       const stream = recordingCanvas.captureStream(frameRate)
//       streamRef.current = stream
      
//       // Get supported MIME type
//       const mimeType = getSupportedMimeType()
//       if (!mimeType) {
//         throw new Error("No supported video recording format found in this browser")
//       }
      
//       // Setup media recorder with best available settings
//       const recorderOptions: MediaRecorderOptions = {
//         mimeType: mimeType
//       }
      
//       // Add bitrate if supported (not all browsers support this option)
//       try {
//         recorderOptions.videoBitsPerSecond = 8000000 // 8 Mbps
//       } catch (e) {
//         console.warn("VideoBitsPerSecond not supported in this browser")
//       }
      
//       const recorder = new MediaRecorder(stream, recorderOptions)
//       mediaRecorderRef.current = recorder
//       recordedChunksRef.current = []
      
//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data)
//         }
//       }
      
//       // recorder.onstop = () => {
//       //   // Determine the best file extension based on MIME type
//       //   let fileExtension = 'webm'
//       //   if (mimeType.includes('mp4')) {
//       //     fileExtension = 'mp4'
//       //   }
        
//       //   const blob = new Blob(recordedChunksRef.current, { type: mimeType })
//       //   recordedChunksRef.current = []
        
//       //   // Create download link
//       //   const url = URL.createObjectURL(blob)
//       //   const a = document.createElement('a')
//       //   a.href = url
//       //   a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-recording.${fileExtension}`
//       //   a.click()
        
//       //   URL.revokeObjectURL(url)
        
//       //   toast({
//       //     title: "Recording saved",
//       //     description: `Your tier list recording has been downloaded as ${fileExtension.toUpperCase()} format.`,
//       //   })
//       // }
      
//       // Start the recorder with chunks collected every second
//       recorder.start(1000)
//       setIsRecording(true)
      
//       // Start a timer to show recording duration
//       const timer = setInterval(() => {
//         setRecordingTime(prev => prev + 1)
//       }, 1000)
//       setRecordingTimer(timer)
      
//       // Start the render loop
//       renderFrame()

//       toast({
//         title: "Recording started",
//         description: `Your tier list is now being recorded in high quality at ${frameRate}fps.`,
//       })
//     } catch (error: any) {
//       console.error("Error starting recording:", error)
//       toast({
//         title: "Recording failed",
//         description: `Failed to start recording: ${error.message}`,
//         variant: "destructive",
//       })
//       setIsRecording(false)
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
//     }).catch(err => {
//       console.error("Error rendering frame:", err)
//       // Continue trying to render if still recording
//       if (isRecording) {
//         animationFrameRef.current = requestAnimationFrame(renderFrame)
//       }
//     })
//   }

//   const stopRecording = (): void => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       mediaRecorderRef.current.stop()
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop())
//     }
    
//     if (recordingTimer) {
//       clearInterval(recordingTimer)
//       setRecordingTimer(null)
//     }
    
//     if (animationFrameRef.current) {
//       cancelAnimationFrame(animationFrameRef.current)
//       animationFrameRef.current = null
//     }
    
//     setIsRecording(false)
//     setRecordingTime(0)
//   }

//   // Format seconds into MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
//     const secs = (seconds % 60).toString().padStart(2, '0')
//     return `${mins}:${secs}`
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
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="flex items-center gap-2"
//               >
//                 <Video size={16} />
//                 Record Tier List
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" ref={animationDialogRef}>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center justify-between">
//                   <span>Record Tier List {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}</span>
//                 </DialogTitle>
//                 <DialogDescription>
//                   {isRecording 
//                     ? "Now recording your tier list in high resolution."
//                     : "Record your tier list to share with others. The recording will be saved in the highest quality available."}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                 <TierList
//                   data={{ ...tierListData, topic: listName }}
//                   onUpdateTierName={isRecording ? () => {} : handleUpdateTierName}
//                   onUpdateTierColor={isRecording ? () => {} : handleUpdateTierColor}
//                 />
//                 <div className="mt-4 flex justify-end items-center gap-2">
//                   {!isRecording ? (
//                     <Button
//                       variant="default"
//                       onClick={startRecording}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
//                       Start Recording
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="default"
//                       onClick={stopRecording}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       <Square className="mr-2 h-4 w-4" />
//                       Stop Recording
//                     </Button>
//                   )}
//                 </div>
//               </div>
//               {isRecording && (
//                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
//                   <p className="font-medium">Recording in progress</p>
//                   <p>Feel free to interact with your tier list while recording. When finished, click "Stop Recording" to save the video.</p>
//                 </div>
//               )}
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }

// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Video, Square } from "lucide-react"
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

// // TypeScript interfaces
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

// // Mock data for the tier list
// const mockTierListData: TierListDataInterface = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListDataInterface): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListDataInterface | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState<TierListDataInterface>(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [recordingTime, setRecordingTime] = useState<number>(0)
//   const [recordingDialogOpen, setRecordingDialogOpen] = useState<boolean>(false)

//   // Refs
//   const tierListRef = useRef<HTMLDivElement>(null)
//   const exportContainerRef = useRef<HTMLDivElement>(null)
//   const recordingDialogRef = useRef<HTMLDivElement>(null)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const recordedChunksRef = useRef<Blob[]>([])
//   const canvasRef = useRef<HTMLCanvasElement | null>(null)
//   const timerRef = useRef<NodeJS.Timeout | null>(null)
//   const frameRef = useRef<number | null>(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   // Cleanup function when component unmounts
//   useEffect(() => {
//     return () => {
//       stopRecording();
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
//       if (frameRef.current) {
//         cancelAnimationFrame(frameRef.current);
//       }
//     }
//   }, [])

//   // Handle dialog close - stop recording if active
//   useEffect(() => {
//     if (!recordingDialogOpen && isRecording) {
//       stopRecording();
//     }
//   }, [recordingDialogOpen, isRecording])

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

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData(JSON.parse(JSON.stringify(mockTierListData)))
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
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
//       console.error("Error generating image:", error)
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

//   // Format seconds into MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
//     const secs = (seconds % 60).toString().padStart(2, '0')
//     return `${mins}:${secs}`
//   }

//   // ========== RECORDING FUNCTIONS ==========

//   const startRecording = async (): Promise<void> => {
//     try {
//       if (!recordingDialogRef.current) {
//         toast({
//           title: "Recording error",
//           description: "Could not find the dialog content to record.",
//           variant: "destructive",
//         })
//         return
//       }

//       toast({
//         title: "Recording permission",
//         description: "Please allow screen recording in the browser dialog.",
//       })

//       // Create and configure a canvas element for recording
//       const canvas = document.createElement('canvas')
//       canvas.width = 3840  // 4K width
//       canvas.height = 2160 // 4K height
//       canvasRef.current = canvas
//       const ctx = canvas.getContext('2d')
      
//       if (!ctx) {
//         throw new Error("Could not get canvas context")
//       }

//       // Start recording timer
//       const timer = setInterval(() => {
//         setRecordingTime(prev => prev + 1)
//       }, 1000)
//       timerRef.current = timer

//       // Start the animation frame loop for rendering
//       const renderTierList = () => {
//         if (!isRecording || !canvasRef.current || !recordingDialogRef.current) return
        
//         const canvas = canvasRef.current
//         const ctx = canvas.getContext('2d')
//         if (!ctx) return
        
//         // Draw white background
//         ctx.fillStyle = '#ffffff'
//         ctx.fillRect(0, 0, canvas.width, canvas.height)
        
//         // Capture the dialog content
//         html2canvas(recordingDialogRef.current, {
//           backgroundColor: '#ffffff',
//           scale: 2, // Higher quality
//           logging: false,
//           allowTaint: true,
//           useCORS: true
//         }).then(capturedCanvas => {
//           // Scale and center the content in the 4K canvas
//           const scale = Math.min(
//             canvas.width / capturedCanvas.width * 0.9,
//             canvas.height / capturedCanvas.height * 0.9
//           )
          
//           const scaledWidth = capturedCanvas.width * scale
//           const scaledHeight = capturedCanvas.height * scale
//           const x = (canvas.width - scaledWidth) / 2
//           const y = (canvas.height - scaledHeight) / 2
          
//           ctx.drawImage(
//             capturedCanvas, 
//             0, 0, capturedCanvas.width, capturedCanvas.height,
//             x, y, scaledWidth, scaledHeight
//           )
          
//           // Continue the loop if still recording
//           if (isRecording) {
//             frameRef.current = requestAnimationFrame(renderTierList)
//           }
//         })
//       }

//       // Start the rendering loop
//       renderTierList()
      
//       // Create a media stream from the canvas with high frame rate
//       const stream = canvas.captureStream(60) // 60fps
      
//       // Create and configure the media recorder with high quality settings
//       const recorder = new MediaRecorder(stream, {
//         mimeType: 'video/webm;codecs=vp9',
//         videoBitsPerSecond: 12000000 // 12 Mbps for ultra high quality
//       })
      
//       mediaRecorderRef.current = recorder
//       recordedChunksRef.current = []
      
//       // Set up data collection
//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data)
//         }
//       }
      
//       // Set up what happens when recording stops
//       recorder.onstop = () => {
//         if (recordedChunksRef.current.length === 0) return
        
//         const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
//         recordedChunksRef.current = []
        
//         // Create and trigger download
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-4k.webm`
//         a.click()
        
//         URL.revokeObjectURL(url)
        
//         toast({
//           title: "Recording complete",
//           description: "Your 4K tier list recording has been saved.",
//         })
//       }
      
//       // Start recording
//       recorder.start(1000) // Collect data every second
//       setIsRecording(true)
      
//       toast({
//         title: "Recording started",
//         description: "Recording in 4K at 60fps. Interact with your tier list freely.",
//       })
//     } catch (error: any) {
//       console.error("Error starting recording:", error)
//       toast({
//         title: "Recording failed",
//         description: `Could not start recording: ${error.message}`,
//         variant: "destructive",
//       })
//       setIsRecording(false)
//       if (timerRef.current) {
//         clearInterval(timerRef.current)
//       }
//     }
//   }

//   const stopRecording = (): void => {
//     // Stop the media recorder if active
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       mediaRecorderRef.current.stop()
//     }
    
//     // Clear the recording timer
//     if (timerRef.current) {
//       clearInterval(timerRef.current)
//       timerRef.current = null
//     }
    
//     // Cancel animation frame if active
//     if (frameRef.current) {
//       cancelAnimationFrame(frameRef.current)
//       frameRef.current = null
//     }
    
//     // Reset recording state
//     setIsRecording(false)
//     setRecordingTime(0)
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
//             setRecordingDialogOpen(open);
//             // If dialog is closed and recording is active, stop recording
//             if (!open && isRecording) {
//               stopRecording();
//             }
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
//             <DialogContent 
//               className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
//               ref={recordingDialogRef}
//               onInteractOutside={(e) => {
//                 // Prevent dialog from closing when interacting outside during recording
//                 if (isRecording) {
//                   e.preventDefault();
//                 }
//               }}
//             >
//               <DialogHeader>
//                 <DialogTitle className="flex items-center justify-between">
//                   <span>Record Tier List {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}</span>
//                 </DialogTitle>
//                 <DialogDescription>
//                   {isRecording 
//                     ? "Recording in progress. Your screen is being captured in 4K at 60fps."
//                     : "Create a high-quality 4K/60fps video of your tier list. Click Record to begin."}
//                 </DialogDescription>
//               </DialogHeader>
              
//               {/* Recording Permission Notice */}
//               {!isRecording && (
//                 <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
//                   <p className="font-medium">Recording permissions</p>
//                   <p>When you start recording, you'll be asked to share your screen. Please select "This tab" or your browser window to capture only the tier list.</p>
//                 </div>
//               )}
              
//               <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                 <TierList
//                   animation
//                   data={{ ...tierListData, topic: listName }}
//                   onUpdateTierName={handleUpdateTierName}
//                   onUpdateTierColor={handleUpdateTierColor}
//                 />
//               </div>
              
//               <div className="mt-4 flex justify-end gap-2">
//                 {isRecording ? (
//                   <Button
//                     variant="destructive"
//                     onClick={stopRecording}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     <Square className="mr-2 h-4 w-4" />
//                     Stop Recording
//                   </Button>
//                 ) : (
//                   <Button
//                     variant="default"
//                     onClick={startRecording}
//                     className="bg-red-600 hover:bg-red-700"
//                   >
//                     <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
//                     Start Recording
//                   </Button>
//                 )}
//               </div>
              
//               {/* Recording indicator */}
//               {isRecording && (
//                 <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
//                   <p className="font-medium">Recording in progress</p>
//                   <p>You can make changes to your tier list while recording. When finished, click "Stop Recording" to save your 4K video.</p>
//                 </div>
//               )}
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square, Video } from "lucide-react"
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

// // Mock data for the tier list
// const mockTierListData: TierListDataInterface = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListDataInterface): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListDataInterface | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState<TierListDataInterface>(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListDataInterface | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [recordingTime, setRecordingTime] = useState<number>(0)
//   const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)

//   const tierListRef = useRef<HTMLDivElement>(null)
//   const exportContainerRef = useRef<HTMLDivElement>(null)
//   const recordingRef = useRef<HTMLCanvasElement | null>(null)
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const recordedChunksRef = useRef<Blob[]>([])
//   const streamRef = useRef<MediaStream | null>(null)
//   const animationDialogRef = useRef<HTMLDivElement>(null)
//   const { toast } = useToast()
//   const router = useRouter()

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
//     }
//   }, [recordingTimer])

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

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData(JSON.parse(JSON.stringify(mockTierListData)))
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
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
//       console.error("Error generating image:", error)
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

//   // Screen recording functions
//   const startRecording = async (): Promise<void> => {
//     try {
//       if (!animationDialogRef.current) {
//         toast({
//           title: "Recording error",
//           description: "Could not find the dialog content to record.",
//           variant: "destructive",
//         })
//         return
//       }

//       // Create a canvas for recording at 4K resolution
//       const recordingCanvas = document.createElement('canvas')
//       const ctx = recordingCanvas.getContext('2d')
      
//       // Set canvas to 4K dimensions (3840x2160) or a specific aspect ratio
//       recordingCanvas.width = 3840
//       recordingCanvas.height = 2160
//       recordingRef.current = recordingCanvas
      
//       // Create a media stream from the canvas
//       const stream = recordingCanvas.captureStream(60) // 60fps
//       streamRef.current = stream
      
//       // Setup media recorder with high quality settings
//       const recorder = new MediaRecorder(stream, {
//         mimeType: 'video/webm;codecs=vp9',
//         videoBitsPerSecond: 8000000 // 8 Mbps for high quality
//       })
      
//       mediaRecorderRef.current = recorder
//       recordedChunksRef.current = []
      
//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           recordedChunksRef.current.push(e.data)
//         }
//       }
      
//       recorder.onstop = () => {
//         const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
//         recordedChunksRef.current = []
        
//         // Create download link
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement('a')
//         a.href = url
//         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-recording.webm`
//         a.click()
        
//         URL.revokeObjectURL(url)
        
//         toast({
//           title: "Recording saved",
//           description: "Your tier list recording has been downloaded.",
//         })
//       }
      
//       // Start the recorder
//       recorder.start(1000) // Collect data every 1 second
//       setIsRecording(true)
      
//       // Start a timer to show recording duration
//       const timer = setInterval(() => {
//         setRecordingTime(prev => prev + 1)
//       }, 1000)
//       setRecordingTimer(timer)
      
//       // Start the render loop
//       renderFrame()

//       toast({
//         title: "Recording started",
//         description: "Your tier list is now being recorded in 4K quality.",
//       })
//     } catch (error: any) {
//       console.error("Error starting recording:", error)
//       toast({
//         title: "Recording failed",
//         description: `Failed to start recording: ${error.message}`,
//         variant: "destructive",
//       })
//       setIsRecording(false)
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
//         requestAnimationFrame(renderFrame)
//       }
//     })
//   }

//   const stopRecording = (): void => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//       mediaRecorderRef.current.stop()
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop())
//     }
    
//     if (recordingTimer) {
//       clearInterval(recordingTimer)
//       setRecordingTimer(null)
//     }
    
//     setIsRecording(false)
//     setRecordingTime(0)
//   }

//   // Format seconds into MM:SS
//   const formatTime = (seconds: number): string => {
//     const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
//     const secs = (seconds % 60).toString().padStart(2, '0')
//     return `${mins}:${secs}`
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
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="flex items-center gap-2"
//               >
//                 <Video size={16} />
//                 Record Tier List
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" ref={animationDialogRef}>
//               <DialogHeader>
//                 <DialogTitle className="flex items-center justify-between">
//                   <span>Record Tier List {isRecording && <span className="text-red-500 ml-2">(Recording: {formatTime(recordingTime)})</span>}</span>
//                 </DialogTitle>
//                 <DialogDescription>
//                   {isRecording 
//                     ? "Now recording your tier list in 4K (3840x2160) at 60fps."
//                     : "Record your tier list to share with others. The recording will be saved in 4K quality."}
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                 <TierList
//                 animation
//                   data={{ ...tierListData, topic: listName }}
//                   onUpdateTierName={isRecording ? () => {} : handleUpdateTierName}
//                   onUpdateTierColor={isRecording ? () => {} : handleUpdateTierColor}
//                 />
//                 <div className="mt-4 flex justify-end items-center gap-2">
//                   {!isRecording ? (
//                     <Button
//                       variant="default"
//                       onClick={startRecording}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       <div className="h-2 w-2 rounded-full bg-white mr-2"></div>
//                       Start Recording
//                     </Button>
//                   ) : (
//                     <Button
//                       variant="default"
//                       onClick={stopRecording}
//                       className="bg-red-600 hover:bg-red-700"
//                     >
//                       <Square className="mr-2 h-4 w-4" />
//                       Stop Recording
//                     </Button>
//                   )}
//                 </div>
//               </div>
//               {isRecording && (
//                 <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
//                   <p className="font-medium">Recording in progress</p>
//                   <p>Feel free to interact with your tier list while recording. When finished, click "Stop Recording" to save the video.</p>
//                 </div>
//               )}
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }

// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square } from "lucide-react"
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
// import { Slider } from "@/components/ui/slider"

// // Type definitions
// interface TierItemData {
//   name: string;
//   explanation: string;
// }

// interface TierData {
//   name: string;
//   color: string;
//   items: TierItemData[];
// }

// interface TierListData {
//   topic: string;
//   tiers: TierData[];
// }

// interface AnimationStep {
//   from: { tier: number, item: number };
//   to: { tier: number, item: number };
//   delay: number;
// }

// // Mock data for the tier list
// const mockTierListData: TierListData = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Wide menu but lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Animation data - defines the sequence of movements for automated animation
// const animationSequence: AnimationStep[] = [
//   { from: { tier: 1, item: 0 }, to: { tier: 0, item: 1 }, delay: 1500 }, // Move Five Guys from A to S
//   { from: { tier: 3, item: 0 }, to: { tier: 2, item: 2 }, delay: 2000 }, // Move McDonald's from C to B
//   { from: { tier: 4, item: 0 }, to: { tier: 3, item: 1 }, delay: 1800 }, // Move Jack in the Box from D to C
//   { from: { tier: 2, item: 1 }, to: { tier: 1, item: 2 }, delay: 1700 }, // Move Wendy's from B to A
// ]

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListData): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListData | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState<TierListData>(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListData | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isAnimating, setIsAnimating] = useState<boolean>(false)
//   const [animationSpeed, setAnimationSpeed] = useState<number>(1)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
//   const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
//   const [animationOverlayVisible, setAnimationOverlayVisible] = useState<boolean>(true)
//   const [animationSteps, setAnimationSteps] = useState<AnimationStep[]>([...animationSequence])

//   const tierListRef = useRef<HTMLDivElement | null>(null)
//   const exportContainerRef = useRef<HTMLDivElement | null>(null)
//   const animationContainerRef = useRef<HTMLDivElement | null>(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   // Manage animation state
//   useEffect(() => {
//     if (!isAnimating) return

//     // Use a copy of the animation data as our starting point
//     let animationData = JSON.parse(JSON.stringify(tierListData)) as TierListData
//     let currentStepIndex = 0
//     let animationTimer: NodeJS.Timeout | null = null

//     const processNextStep = () => {
//       if (!isAnimating || currentStepIndex >= animationSteps.length) {
//         // Animation complete
//         setIsAnimating(false)
//         if (isRecording && mediaRecorder) {
//           setTimeout(() => {
//             stopRecording();
//           }, 1000); // Give a little buffer at the end of the recording
//         }
//         return;
//       }

//       const currentStep = animationSteps[currentStepIndex];
//       currentStepIndex++;

//       // Execute this animation step
//       try {
//         // Deep copy to avoid reference issues
//         const updatedData = JSON.parse(JSON.stringify(animationData)) as TierListData;
        
//         // Make sure both source and target tiers exist
//         if (updatedData.tiers[currentStep.from.tier] && 
//             updatedData.tiers[currentStep.to.tier]) {
          
//           // Make sure source item exists
//           if (updatedData.tiers[currentStep.from.tier].items[currentStep.from.item]) {
//             // Get the item to move
//             const itemToMove = {...updatedData.tiers[currentStep.from.tier].items[currentStep.from.item]};
            
//             // Remove the item from source
//             updatedData.tiers[currentStep.from.tier].items.splice(currentStep.from.item, 1);
            
//             // Add to target position (handle index bounds)
//             const targetTier = updatedData.tiers[currentStep.to.tier];
//             const targetIndex = Math.min(currentStep.to.item, targetTier.items.length);
//             targetTier.items.splice(targetIndex, 0, itemToMove);
            
//             // Update state and local copy
//             setTierListData(updatedData);
//             animationData = updatedData;
//           }
//         }
//       } catch (error) {
//         console.error("Error during animation step:", error);
//       }

//       // Schedule next step based on speed
//       animationTimer = setTimeout(
//         processNextStep, 
//         currentStepIndex < animationSteps.length ? animationSteps[currentStepIndex].delay / animationSpeed : 0
//       );
//     };

//     // Start the animation sequence
//     processNextStep();

//     // Cleanup function
//     return () => {
//       if (animationTimer) {
//         clearTimeout(animationTimer);
//       }
//     };
//   }, [isAnimating, animationSpeed]);

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
//     saveTierListToStorage({
//       ...tierListData,
//       topic: listName,
//     })
//     setPreviousTierList({
//       ...tierListData,
//       topic: listName,
//     })

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData({
//         ...mockTierListData,
//         tiers: mockTierListData.tiers.map((tier) => ({
//           ...tier,
//           items: [...tier.items], // Create a deep copy
//         })),
//       })
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
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
//       buttonsToRemove.forEach((button) => button.remove())

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
//       console.error("Error generating image:", error)
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

//   // Start tab recording
//   const startTabRecording = async (): Promise<void> => {
//     try {
//       // Request tab capture instead of component capture
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: {
//           displaySurface: "browser",
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//           frameRate: { ideal: 30 }
//         },
//         audio: false,
//       });

//       // Create media recorder with better settings
//       const recorder = new MediaRecorder(stream, {
//         mimeType: 'video/webm;codecs=vp9',
//         videoBitsPerSecond: 3000000 // 3Mbps for better quality
//       });
      
//       setMediaRecorder(recorder);
      
//       const chunks: Blob[] = [];
//       recorder.ondataavailable = (e: BlobEvent) => {
//         if (e.data.size > 0) {
//           chunks.push(e.data);
//         }
//       };
      
//       recorder.onstop = () => {
//         // Combine recorded chunks into a video file
//         const blob = new Blob(chunks, { type: "video/webm" });
        
//         // Create download link
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-animation.webm`;
//         a.click();
        
//         // Clean up
//         URL.revokeObjectURL(url);
//         stream.getTracks().forEach(track => track.stop());
        
//         toast({
//           title: "Recording complete",
//           description: "Your tier list animation has been downloaded.",
//         });
        
//         setIsRecording(false);
//       };
      
//       // Start the recorder
//       recorder.start(1000); // 1-second chunks for stability
//       setRecordedChunks([]);
//       setIsRecording(true);
      
//       toast({
//         title: "Recording started",
//         description: "Your browser tab is now being recorded. Please stay on this tab.",
//       });
//     } catch (error) {
//       console.error("Error starting tab recording:", error);
//       toast({
//         title: "Recording failed",
//         description: "There was an error starting the recording: " + (error as Error).message,
//         variant: "destructive",
//       });
//       setIsRecording(false);
//     }
//   };

//   // Stop recording
//   const stopRecording = (): void => {
//     if (mediaRecorder && mediaRecorder.state !== "inactive") {
//       mediaRecorder.stop();
      
//       // Ensure any tracks are stopped
//       if (mediaRecorder.stream) {
//         mediaRecorder.stream.getTracks().forEach(track => track.stop());
//       }
//     }
//   };

//   // Start animation with optional recording
//   const startAnimation = (withRecording = false): void => {
//     // Reset to original data first
//     setTierListData(JSON.parse(JSON.stringify(mockTierListData)));
    
//     // Initialize animation steps
//     setAnimationSteps([...animationSequence]);
    
//     // Start recording if requested
//     if (withRecording) {
//       startTabRecording().then(() => {
//         // Wait a moment for recording to start before animating
//         setTimeout(() => {
//           setIsAnimating(true);
//         }, 1000);
//       });
//     } else {
//       setIsAnimating(true);
//     }
//   };

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
//                           const target = e.target as HTMLInputElement;
//                           handleUpdateListName(target.value);
//                         }
//                       }}
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <Button onClick={() => {
//                       const input = document.getElementById("list-name") as HTMLInputElement;
//                       handleUpdateListName(input.value);
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
//           {/* Animation button */}
//           {animationOverlayVisible && (
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2"
//                 >
//                   <Play size={16} />
//                   Start Animation Mode
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Animate Tier List</DialogTitle>
//                   <DialogDescription>Animate the flow for videos</DialogDescription>
//                 </DialogHeader>
//                 <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                   {/* The animation container */}
//                   <div ref={animationContainerRef}>
//                     <TierList
//                       animation
//                       data={{ ...tierListData, topic: listName }}
//                       onUpdateTierName={() => { }} // Read-only during animation
//                       onUpdateTierColor={() => { }} // Read-only during animation
//                     />
//                   </div>
//                   <div className="mt-4 flex justify-between items-center">
//                     <div className="w-1/2 flex items-center gap-2">
//                       <Label htmlFor="animation-speed">Animation Speed</Label>
//                       <Slider
//                         id="animation-speed"
//                         min={0.5}
//                         max={2}
//                         step={0.1}
//                         value={[animationSpeed]}
//                         onValueChange={(value) => setAnimationSpeed(value[0])}
//                         disabled={isAnimating}
//                         className="w-32"
//                       />
//                       <span className="text-sm">{animationSpeed.toFixed(1)}x</span>
//                     </div>
//                     <div className="flex gap-2">
//                       {isAnimating ? (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             setIsAnimating(false)
//                             if (isRecording) {
//                               stopRecording()
//                             }
//                           }}
//                           disabled={!isAnimating}
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => startAnimation(false)}
//                           disabled={isAnimating}
//                         >
//                           <Play className="mr-2 h-4 w-4" />
//                           Start Animation
//                         </Button>
//                       )}
//                       {!isRecording ? (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => startAnimation(true)}
//                           disabled={isAnimating || isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <div className="h-2 w-2 rounded-full bg-white mr-2" />
//                           Record Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={stopRecording}
//                           disabled={!isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Recording
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           )}

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
//                     onUpdateTierName={() => { }} // Read-only
//                     onUpdateTierColor={() => { }} // Read-only
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }


// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square } from "lucide-react"
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
// import { Slider } from "@/components/ui/slider"

// // Type definitions
// interface TierItemData {
//   name: string;
//   explanation: string;
// }

// interface TierData {
//   name: string;
//   color: string;
//   items: TierItemData[];
// }

// interface TierListData {
//   topic: string;
//   tiers: TierData[];
// }

// interface AnimationStep {
//   from: { tier: number, item: number };
//   to: { tier: number, item: number };
//   delay: number;
// }

// // Mock data for the tier list
// const mockTierListData: TierListData = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Wide menu but lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Animation data - defines the sequence of movements for automated animation
// const animationSequence: AnimationStep[] = [
//   { from: { tier: 1, item: 0 }, to: { tier: 0, item: 0 }, delay: 1500 }, // Move Five Guys from A to S
//   { from: { tier: 3, item: 0 }, to: { tier: 2, item: 2 }, delay: 2000 }, // Move McDonald's from C to B
//   { from: { tier: 4, item: 0 }, to: { tier: 3, item: 1 }, delay: 1800 }, // Move Jack in the Box from D to C
//   { from: { tier: 2, item: 1 }, to: { tier: 1, item: 2 }, delay: 1700 }, // Move Wendy's from B to A
// ]

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierListData): void => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = (): TierListData | null => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState<TierListData>(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState<TierListData | null>(null)
//   const [isRegenerating, setIsRegenerating] = useState<boolean>(false)
//   const [listName, setListName] = useState<string>(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState<boolean>(false)
//   const [showExportDialog, setShowExportDialog] = useState<boolean>(false)
//   const [includeExplanations, setIncludeExplanations] = useState<boolean>(false)
//   const [isAnimating, setIsAnimating] = useState<boolean>(false)
//   const [animationSpeed, setAnimationSpeed] = useState<number>(1)
//   const [isRecording, setIsRecording] = useState<boolean>(false)
//   const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
//   const [recordedChunks, setRecordedChunks] = useState<Blob[]>([])
//   const [animationOverlayVisible, setAnimationOverlayVisible] = useState<boolean>(true)

//   const tierListRef = useRef<HTMLDivElement | null>(null)
//   const exportContainerRef = useRef<HTMLDivElement | null>(null)
//   const animationContainerRef = useRef<HTMLDivElement | null>(null)
//   const recordingRef = useRef<HTMLDivElement | null>(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   // Set up animation sequences and component recording
//   useEffect(() => {
//     if (isAnimating && animationOverlayVisible) {
//       // Clone current tier list for animation
//       const animationData = JSON.parse(JSON.stringify(tierListData)) as TierListData

//       // Start recording if enabled
//       if (isRecording) {
//         startComponentRecording()
//       }

//       // Process animation sequences
//       let currentIndex = 0
//       const processNextAnimation = () => {
//         if (currentIndex >= animationSequence.length) {
//           // Animation complete
//           setIsAnimating(false)
//           if (isRecording) {
//             stopRecording()
//           }
//           return
//         }

//         const move = animationSequence[currentIndex]
//         setTimeout(() => {
//           // Create a deep copy to avoid reference issues
//           const newData = JSON.parse(JSON.stringify(animationData)) as TierListData

//           // Get the item to move
//           const itemToMove = { ...newData.tiers[move.from.tier].items[move.from.item] }

//           // Remove item from source
//           newData.tiers[move.from.tier].items.splice(move.from.item, 1)

//           // Add item to destination
//           newData.tiers[move.to.tier].items.splice(move.to.item, 0, itemToMove)

//           // Update the animation data
//           setTierListData(newData)

//           // Move to next animation
//           currentIndex++
//           processNextAnimation()
//         }, move.delay / animationSpeed)
//       }

//       // Start the animation sequence
//       processNextAnimation()
//     }
//   }, [isAnimating, animationOverlayVisible, animationSpeed])

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
//     saveTierListToStorage({
//       ...tierListData,
//       topic: listName,
//     })
//     setPreviousTierList({
//       ...tierListData,
//       topic: listName,
//     })

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData({
//         ...mockTierListData,
//         tiers: mockTierListData.tiers.map((tier) => ({
//           ...tier,
//           items: [...tier.items], // Create a deep copy
//         })),
//       })
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
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
//       buttonsToRemove.forEach((button) => button.remove())

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
//       console.error("Error generating image:", error)
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

//   // Start component-only recording using canvas capture approach
//   const startComponentRecording = async (): Promise<void> => {
//     try {
//       if (!animationContainerRef.current && !recordingRef.current) {
//         toast({
//           title: "Recording failed",
//           description: "Component reference not found for recording.",
//           variant: "destructive",
//         })
//         return
//       }
      
//       // Use the animation container ref or fall back to recording ref
//       const targetElement = animationContainerRef.current || recordingRef.current
      
//       // Create a canvas stream for recording just the component
//       const stream = await createCanvasStream(targetElement as HTMLElement)
      
//       if (!stream) {
//         throw new Error("Failed to create canvas stream")
//       }
      
//       // Create media recorder from the canvas stream
//       const recorder = new MediaRecorder(stream, {
//         mimeType: 'video/webm;codecs=vp9',
//         videoBitsPerSecond: 2500000, // Higher quality
//       })
      
//       setMediaRecorder(recorder)
      
//       const chunks: Blob[] = []
//       recorder.ondataavailable = (e: BlobEvent) => {
//         if (e.data.size > 0) {
//           chunks.push(e.data)
//         }
//       }
      
//       recorder.onstop = () => {
//         // Combine recorded chunks into a video file
//         const blob = new Blob(chunks, { type: "video/webm" })
        
//         // Create download link
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-animation.webm`
//         a.click()
        
//         // Clean up
//         URL.revokeObjectURL(url)
        
//         toast({
//           title: "Recording complete",
//           description: "Your tier list animation has been downloaded.",
//         })
        
//         setIsRecording(false)
//         setRecordedChunks([])
//       }
      
//       // Start recording
//       recorder.start(100) // Collect data in 100ms chunks for smoother recording
//       setRecordedChunks([])
      
//       toast({
//         title: "Recording started",
//         description: "Your tier list animation is now being recorded.",
//       })
//     } catch (error) {
//       console.error("Error starting component recording:", error)
//       toast({
//         title: "Recording failed",
//         description: "There was an error starting the component recording: " + (error as Error).message,
//         variant: "destructive",
//       })
//       setIsRecording(false)
//     }
//   }
  
//   // Helper function to create a canvas stream from a component
//   const createCanvasStream = async (element: HTMLElement): Promise<MediaStream | null> => {
//     if (!element) return null
    
//     const canvas = document.createElement('canvas')
//     const ctx = canvas.getContext('2d')
    
//     // Set canvas dimensions to match component size
//     const rect = element.getBoundingClientRect()
//     canvas.width = rect.width
//     canvas.height = rect.height
    
//     if (!ctx) return null
    
//     // Function to capture frames
//     const captureFrame = async () => {
//       try {
//         // Clear canvas and draw component to it
//         ctx.clearRect(0, 0, canvas.width, canvas.height)
        
//         // Use html2canvas for better rendering quality
//         const tempCanvas = await html2canvas(element, {
//           backgroundColor: null,
//           scale: 1,
//           logging: false,
//           useCORS: true,
//         })
        
//         ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
        
//         // Schedule next frame if still recording
//         if (isRecording) {
//           requestAnimationFrame(captureFrame)
//         }
//       } catch (error) {
//         console.error("Error capturing frame:", error)
//       }
//     }
    
//     // Start capturing frames
//     captureFrame()
    
//     // Get canvas stream
//     return canvas.captureStream(30) // 30 FPS
//   }

//   // Stop screen recording
//   const stopRecording = (): void => {
//     if (mediaRecorder && mediaRecorder.state !== "inactive") {
//       mediaRecorder.stop()
//     }
//   }

//   // Start the automated animation with optional recording
//   const startAnimation = (withRecording = false): void => {
//     // Reset to original data first
//     setTierListData(JSON.parse(JSON.stringify(mockTierListData)))

//     // Make the animation overlay visible
//     setAnimationOverlayVisible(true)

//     // Set recording flag if requested
//     setIsRecording(withRecording)

//     // Wait a moment for the overlay to render then start animation
//     setTimeout(() => {
//       setIsAnimating(true)
//     }, 500)
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
//                           const target = e.target as HTMLInputElement;
//                           handleUpdateListName(target.value);
//                         }
//                       }}
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <Button onClick={() => {
//                       const input = document.getElementById("list-name") as HTMLInputElement;
//                       handleUpdateListName(input.value);
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
//           {/* Animation button */}
//           {animationOverlayVisible && (
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2"
//                 >
//                   <Play size={16} />
//                   Start Animation Mode
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Animate Tier List</DialogTitle>
//                   <DialogDescription>Animate the flow for videos</DialogDescription>
//                 </DialogHeader>
//                 <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                   {/* The component we'll record - ref needed */}
//                   <div ref={animationContainerRef}>
//                     <TierList
//                       animation
//                       data={{ ...tierListData, topic: listName }}
//                       onUpdateTierName={() => { }} // Read-only during animation
//                       onUpdateTierColor={() => { }} // Read-only during animation
//                     />
//                   </div>
//                   <div className="mt-4 flex justify-between items-center">
//                     <div className="w-1/2 flex items-center gap-2">
//                       <Label htmlFor="animation-speed">Animation Speed</Label>
//                       <Slider
//                         id="animation-speed"
//                         min={0.5}
//                         max={2}
//                         step={0.1}
//                         value={[animationSpeed]}
//                         onValueChange={(value) => setAnimationSpeed(value[0])}
//                         disabled={isAnimating}
//                         className="w-32"
//                       />
//                       <span className="text-sm">{animationSpeed.toFixed(1)}x</span>
//                     </div>
//                     <div className="flex gap-2">
//                       {isAnimating ? (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             setIsAnimating(false)
//                             if (isRecording) {
//                               stopRecording()
//                             }
//                           }}
//                           disabled={!isAnimating}
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => startAnimation(false)}
//                           disabled={isAnimating}
//                         >
//                           <Play className="mr-2 h-4 w-4" />
//                           Start Animation
//                         </Button>
//                       )}
//                       {!isRecording ? (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => startAnimation(true)}
//                           disabled={isAnimating || isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <div className="h-2 w-2 rounded-full bg-white mr-2" />
//                           Record Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={stopRecording}
//                           disabled={!isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Recording
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           )}

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
//                     onUpdateTierName={() => { }} // Read-only
//                     onUpdateTierColor={() => { }} // Read-only
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }


// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList, { TierItem } from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit, Play, Square } from "lucide-react"
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
// import { Slider } from "@/components/ui/slider"

// // Mock data for the tier list
// const mockTierListData = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Wide menu but lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Animation data - defines the sequence of movements for automated animation
// const animationSequence = [
//   { from: { tier: 1, item: 0 }, to: { tier: 0, item: 0 }, delay: 1500 }, // Move Five Guys from A to S
//   { from: { tier: 3, item: 0 }, to: { tier: 2, item: 2 }, delay: 2000 }, // Move McDonald's from C to B
//   { from: { tier: 4, item: 0 }, to: { tier: 3, item: 1 }, delay: 1800 }, // Move Jack in the Box from D to C
//   { from: { tier: 2, item: 1 }, to: { tier: 1, item: 2 }, delay: 1700 }, // Move Wendy's from B to A
// ]

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList: TierItem) => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = () => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState(null)
//   const [isRegenerating, setIsRegenerating] = useState(false)
//   const [listName, setListName] = useState(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState(false)
//   const [showExportDialog, setShowExportDialog] = useState(false)
//   const [includeExplanations, setIncludeExplanations] = useState(false)
//   const [isAnimating, setIsAnimating] = useState(false)
//   const [animationSpeed, setAnimationSpeed] = useState(1)
//   const [isRecording, setIsRecording] = useState(false)
//   const [mediaRecorder, setMediaRecorder] = useState(null)
//   const [recordedChunks, setRecordedChunks] = useState([])
//   const [animationOverlayVisible, setAnimationOverlayVisible] = useState(true)

//   const tierListRef = useRef(null)
//   const exportContainerRef = useRef(null)
//   const animationContainerRef = useRef(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   // Set up animation sequences and screen recording
//   useEffect(() => {
//     if (isAnimating && animationOverlayVisible) {
//       // Clone current tier list for animation
//       const animationData = JSON.parse(JSON.stringify(tierListData))

//       // Start recording if enabled
//       if (isRecording) {
//         startRecording()
//       }

//       // Process animation sequences
//       let currentIndex = 0
//       const processNextAnimation = () => {
//         if (currentIndex >= animationSequence.length) {
//           // Animation complete
//           setIsAnimating(false)
//           if (isRecording) {
//             stopRecording()
//           }
//           return
//         }

//         const move = animationSequence[currentIndex]
//         setTimeout(() => {
//           // Create a deep copy to avoid reference issues
//           const newData = JSON.parse(JSON.stringify(animationData))

//           // Get the item to move
//           const itemToMove = { ...newData.tiers[move.from.tier].items[move.from.item] }

//           // Remove item from source
//           newData.tiers[move.from.tier].items.splice(move.from.item, 1)

//           // Add item to destination
//           newData.tiers[move.to.tier].items.splice(move.to.item, 0, itemToMove)

//           // Update the animation data
//           setTierListData(newData)

//           // Move to next animation
//           currentIndex++
//           processNextAnimation()
//         }, move.delay / animationSpeed)
//       }

//       // Start the animation sequence
//       processNextAnimation()
//     }
//   }, [isAnimating, animationOverlayVisible])

//   const handleUpdateTierName = (tierIndex: any, newName: any) => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].name = newName
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleUpdateTierColor = (tierIndex: any, newColor: any) => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].color = newColor
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleRegenerate = () => {
//     setIsRegenerating(true)

//     // Save current tier list before regenerating
//     // saveTierListToStorage({
//     //   ...tierListData,
//     //   topic: listName,
//     // })
//     // setPreviousTierList({
//     //   ...tierListData,
//     //   topic: "",
//     // })

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData({
//         ...mockTierListData,
//         tiers: mockTierListData.tiers.map((tier) => ({
//           ...tier,
//           items: [...tier.items], // Create a deep copy
//         })),
//       })
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
//   }

//   const handleDownloadAsImage = async () => {
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
//       const tierListClone = exportContainerRef.current.cloneNode(true)

//       // Remove any buttons, tooltips, or interactive elements
//       const buttonsToRemove = tierListClone.querySelectorAll('button, [role="button"]')
//       buttonsToRemove.forEach((button: any) => button.remove())

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
//           explanation.style.display = "none"
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
//       console.error("Error generating image:", error)
//       toast({
//         title: "Download failed",
//         description: "There was an error generating your tier list image.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleUpdateListName = (newName) => {
//     if (newName.trim()) {
//       setListName(newName.trim())
//       setIsEditingName(false)
//     }
//   }

//   // Start screen recording
//   const startRecording = async () => {
//     try {
//       // Request screen capture
//       const stream = await navigator.mediaDevices.getDisplayMedia({
//         video: { displaySurface: "browser" },
//         audio: false,
//       })

//       // Create media recorder
//       const recorder = new MediaRecorder(stream)
//       setMediaRecorder(recorder)

//       const chunks = []
//       recorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           chunks.push(e.data)
//         }
//       }

//       recorder.onstop = () => {
//         // Combine recorded chunks into a video file
//         const blob = new Blob(chunks, { type: "video/webm" })
//         setRecordedChunks([])

//         // Create download link
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a")
//         a.href = url
//         a.download = `${listName.replace(/\s+/g, "-").toLowerCase()}-tier-list-animation.webm`
//         a.click()

//         // Clean up
//         URL.revokeObjectURL(url)
//         stream.getTracks().forEach(track => track.stop())

//         toast({
//           title: "Recording complete",
//           description: "Your tier list animation has been downloaded.",
//         })

//         setIsRecording(false)
//       }

//       // Start recording
//       recorder.start()
//       setRecordedChunks([])
//       setIsRecording(true)

//       toast({
//         title: "Recording started",
//         description: "Your tier list animation is now being recorded.",
//       })
//     } catch (error) {
//       console.error("Error starting screen recording:", error)
//       toast({
//         title: "Recording failed",
//         description: "There was an error starting the screen recording.",
//         variant: "destructive",
//       })
//       setIsRecording(false)
//     }
//   }

//   // Stop screen recording
//   const stopRecording = () => {
//     if (mediaRecorder && mediaRecorder.state !== "inactive") {
//       mediaRecorder.stop()
//     }
//   }

//   // Start the automated animation with optional recording
//   const startAnimation = (withRecording = false) => {
//     // Reset to original data first
//     setTierListData(JSON.parse(JSON.stringify(mockTierListData)))

//     // Make the animation overlay visible
//     setAnimationOverlayVisible(true)

//     // Set recording flag if requested
//     setIsRecording(withRecording)

//     // Wait a moment for the overlay to render then start animation
//     setTimeout(() => {
//       setIsAnimating(true)
//     }, 500)
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
//                           handleUpdateListName(e.currentTarget.value)
//                         }
//                       }}
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <Button onClick={() => handleUpdateListName(document.getElementById("list-name").value)}>
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
//           {/* Animation button */}
//           {animationOverlayVisible && (
//             <Dialog>
//               <DialogTrigger asChild>

//                 <Button
//                   variant="outline"
//                   className="flex items-center gap-2"
//                 >
//                   <Play size={16} />
//                   Start Animation Mode
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//                 <DialogHeader>
//                   <DialogTitle>Animate Tier List</DialogTitle>
//                   <DialogDescription>Animate the flow for videos</DialogDescription>
//                 </DialogHeader>
//                 <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-4">
//                   <TierList
//                     animation
//                     data={{ ...tierListData, topic: listName }}
//                     onUpdateTierName={() => { }} // Read-only during animation
//                     onUpdateTierColor={() => { }} // Read-only during animation
//                   />
//                   <div className="mt-4 flex justify-between items-center">
//                     <div className="w-1/2 flex items-center gap-2">
//                       <Label htmlFor="animation-speed">Animation Speed</Label>
//                       <Slider
//                         id="animation-speed"
//                         min={0.5}
//                         max={2}
//                         step={0.1}
//                         value={[animationSpeed]}
//                         onValueChange={(value) => setAnimationSpeed(value[0])}
//                         disabled={isAnimating}
//                         className="w-32"
//                       />
//                       <span className="text-sm">{animationSpeed.toFixed(1)}x</span>
//                     </div>
//                     <div className="flex gap-2">
//                       {isAnimating ? (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             setIsAnimating(false)
//                             if (isRecording) {
//                               stopRecording()
//                             }
//                           }}
//                           disabled={!isAnimating}
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => startAnimation(false)}
//                           disabled={isAnimating}
//                         >
//                           <Play className="mr-2 h-4 w-4" />
//                           Start Animation
//                         </Button>
//                       )}
//                       {!isRecording ? (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={() => startAnimation(true)}
//                           disabled={isAnimating || isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <div className="h-2 w-2 rounded-full bg-white mr-2" />
//                           Record Animation
//                         </Button>
//                       ) : (
//                         <Button
//                           variant="default"
//                           size="sm"
//                           onClick={stopRecording}
//                           disabled={!isRecording}
//                           className="bg-red-600 hover:bg-red-700"
//                         >
//                           <Square className="mr-2 h-4 w-4" />
//                           Stop Recording
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </DialogContent>
//             </Dialog>



//           )}





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
//                     onCheckedChange={(checked) => setIncludeExplanations(checked)}
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
//                     onUpdateTierName={() => { }} // Read-only
//                     onUpdateTierColor={() => { }} // Read-only
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
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }
// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import Header from "@/components/header"
// import Footer from "@/components/footer"
// import TierList from "@/components/tier-list"
// import { Button } from "@/components/ui/button"
// import { Download, RefreshCw, History, Edit } from "lucide-react"
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

// // Mock data for the tier list
// const mockTierListData = {
//   topic: "Fast Food Chains",
//   tiers: [
//     {
//       name: "S",
//       color: "#FFD700",
//       items: [
//         {
//           name: "In-N-Out",
//           explanation: "High quality and great value, consistently ranked best by consumers.",
//         },
//       ],
//     },
//     {
//       name: "A",
//       color: "#3b82f6",
//       items: [
//         {
//           name: "Five Guys",
//           explanation: "Premium quality but higher price point. Great customization options.",
//         },
//         {
//           name: "Chick-fil-A",
//           explanation: "Excellent customer service and consistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "B",
//       color: "#10B981",
//       items: [
//         {
//           name: "Shake Shack",
//           explanation: "Good quality but limited availability and higher prices.",
//         },
//         {
//           name: "Wendy's",
//           explanation: "Better quality than most fast food, with fresh ingredients.",
//         },
//       ],
//     },
//     {
//       name: "C",
//       color: "#F59E0B",
//       items: [
//         {
//           name: "McDonald's",
//           explanation: "Consistent but average quality. Convenient and affordable.",
//         },
//         {
//           name: "Burger King",
//           explanation: "Decent options but inconsistent quality across locations.",
//         },
//       ],
//     },
//     {
//       name: "D",
//       color: "#EF4444",
//       items: [
//         {
//           name: "Jack in the Box",
//           explanation: "Wide menu but lower quality ingredients and preparation.",
//         },
//       ],
//     },
//   ],
// }

// // Function to save tier list to localStorage
// const saveTierListToStorage = (tierList) => {
//   try {
//     localStorage.setItem("previousTierList", JSON.stringify(tierList))
//   } catch (error) {
//     console.error("Error saving tier list to localStorage:", error)
//   }
// }

// // Function to get tier list from localStorage
// const getPreviousTierList = () => {
//   try {
//     const savedTierList = localStorage.getItem("previousTierList")
//     return savedTierList ? JSON.parse(savedTierList) : null
//   } catch (error) {
//     console.error("Error retrieving tier list from localStorage:", error)
//     return null
//   }
// }

// export default function ResultsPage() {
//   const [tierListData, setTierListData] = useState(mockTierListData)
//   const [previousTierList, setPreviousTierList] = useState(null)
//   const [isRegenerating, setIsRegenerating] = useState(false)
//   const [listName, setListName] = useState(mockTierListData.topic)
//   const [isEditingName, setIsEditingName] = useState(false)
//   const [showExportDialog, setShowExportDialog] = useState(false)
//   const [includeExplanations, setIncludeExplanations] = useState(false)
//   const tierListRef = useRef(null)
//   const exportContainerRef = useRef(null)
//   const { toast } = useToast()
//   const router = useRouter()

//   // Load previous tier list from localStorage on component mount
//   useEffect(() => {
//     const savedTierList = getPreviousTierList()
//     if (savedTierList) {
//       setPreviousTierList(savedTierList)
//     }
//   }, [])

//   const handleUpdateTierName = (tierIndex, newName) => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].name = newName
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleUpdateTierColor = (tierIndex, newColor) => {
//     const newTiers = [...tierListData.tiers]
//     newTiers[tierIndex].color = newColor
//     setTierListData({
//       ...tierListData,
//       tiers: newTiers,
//     })
//   }

//   const handleRegenerate = () => {
//     setIsRegenerating(true)

//     // Save current tier list before regenerating
//     saveTierListToStorage({
//       ...tierListData,
//       topic: listName,
//     })
//     setPreviousTierList({
//       ...tierListData,
//       topic: listName,
//     })

//     // Simulate API call
//     setTimeout(() => {
//       setIsRegenerating(false)
//       // Reset to a new tier list (in a real app, this would fetch new data)
//       setTierListData({
//         ...mockTierListData,
//         tiers: mockTierListData.tiers.map((tier) => ({
//           ...tier,
//           items: [...tier.items], // Create a deep copy
//         })),
//       })
//       setListName(mockTierListData.topic)

//       toast({
//         title: "Tier list regenerated",
//         description: "Your tier list has been updated with new rankings.",
//       })
//     }, 1500)
//   }

//   const handleDownloadAsImage = async () => {
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
//       const tierListClone = exportContainerRef.current.cloneNode(true)

//       // Remove any buttons, tooltips, or interactive elements
//       const buttonsToRemove = tierListClone.querySelectorAll('button, [role="button"]')
//       buttonsToRemove.forEach((button) => button.remove())

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
//           explanation.style.display = "none"
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
//       console.error("Error generating image:", error)
//       toast({
//         title: "Download failed",
//         description: "There was an error generating your tier list image.",
//         variant: "destructive",
//       })
//     }
//   }

//   const handleUpdateListName = (newName) => {
//     if (newName.trim()) {
//       setListName(newName.trim())
//       setIsEditingName(false)
//     }
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
//                           handleUpdateListName(e.currentTarget.value)
//                         }
//                       }}
//                     />
//                   </div>
//                   <div className="flex justify-end">
//                     <Button onClick={() => handleUpdateListName(document.getElementById("list-name").value)}>
//                       Save
//                     </Button>
//                   </div>
//                 </div>
//               </PopoverContent>
//             </Popover>
//           </div>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">AI-generated rankings based on your criteria</p>
//         </div>

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
//                     onCheckedChange={(checked) => setIncludeExplanations(checked as boolean)}
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

//           <Button
//             onClick={handleRegenerate}
//             disabled={isRegenerating}
//             className="flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb]"
//           >
//             <RefreshCw size={16} className={isRegenerating ? "animate-spin" : ""} />
//             {isRegenerating ? "Regenerating..." : "Regenerate"}
//           </Button>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   )
// }
