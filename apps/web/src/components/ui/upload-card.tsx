"use client"

import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, FileText, Image, Video, FileArchive, Check, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "./button"

export interface UploadFile {
    file: File
    id: string
    progress: number
    status: "pending" | "uploading" | "completed" | "error"
    error?: string
    customName?: string
}

interface UploadCardProps extends React.HTMLAttributes<HTMLDivElement> {
    onFilesSelected: (files: File[]) => void
    maxFileSize?: number
    accept?: string
    multiple?: boolean
    disabled?: boolean
    // New props for the integrated 3-column setup
    selectedFolder: string
    onFolderChange: (folder: string) => void
    customFolder: string
    onCustomFolderChange: (path: string) => void
    uploadQueue: UploadFile[]
    onRemove: (id: string) => void
    onRename: (id: string, newName: string) => void
    onUpload: () => void
    uploading: boolean
}

export function UploadCard({
    onFilesSelected,
    maxFileSize = 19.9 * 1024 * 1024,
    accept,
    multiple = true,
    disabled = false,
    className,
    selectedFolder,
    onFolderChange,
    customFolder,
    onCustomFolderChange,
    uploadQueue,
    onRemove,
    onRename,
    onUpload,
    uploading,
    ...props
}: UploadCardProps) {
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
            setIsDragging(true)
        }
    }, [disabled])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const droppedFiles = Array.from(e.dataTransfer.files)
        const validFiles = droppedFiles.filter(file => {
            if (maxFileSize && file.size > maxFileSize) {
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            onFilesSelected(validFiles)
        }
    }, [disabled, maxFileSize, onFilesSelected])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files
        if (!selectedFiles) return

        const filesArray = Array.from(selectedFiles)
        const validFiles = filesArray.filter(file => {
            if (maxFileSize && file.size > maxFileSize) {
                return false
            }
            return true
        })

        if (validFiles.length > 0) {
            onFilesSelected(validFiles)
        }

        e.target.value = ""
    }, [maxFileSize, onFilesSelected])

    // Content height anchors
    const TILE_HEIGHT = 100
    const GAP = 8
    const GRID_HEIGHT = (TILE_HEIGHT * 3) + (GAP * 2)
    const LIST_HEIGHT = (TILE_HEIGHT * 2) + GAP
    const ACTION_ROW_HEIGHT = TILE_HEIGHT

    // Content height anchors - Pixel Perfect Constants
    const TILE_H = 100
    const G = 8
    const GRID_H = (TILE_H * 3) + (G * 2) // 316px
    const TOP_SLICE_H = (TILE_H * 2) + G   // 208px
    const BTM_SLICE_H = TILE_H             // 100px

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-3xl shadow-2xl transition-all duration-500",
                className
            )}
            {...props}
        >
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-white/5 h-full">
                {/* Column 1: Destination Selector (The Constraint) */}
                <div className="w-full md:w-[28%] p-8 bg-black/20 flex flex-col">
                    <div className="h-10 flex flex-col justify-center mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                            1. Destination
                        </h3>
                        <div className="text-[10px] text-white/30 mt-1 font-bold">
                            Target: /{selectedFolder === "custom" ? (customFolder || "custom") : selectedFolder}/
                        </div>
                    </div>

                    <div style={{ height: GRID_H }}>
                        <FolderSelector
                            selectedFolder={selectedFolder}
                            onFolderChange={onFolderChange}
                            customFolder={customFolder}
                            onCustomFolderChange={onCustomFolderChange}
                            disabled={disabled || uploading}
                            variant="vertical"
                        />
                    </div>
                </div>

                {/* Column 2: Upload Area (Source) */}
                <div className="w-full md:w-[44%] p-8 flex flex-col bg-white/2">
                    <div className="h-10 flex flex-col justify-center mb-8 text-center">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                            2. Source
                        </h3>
                        <p className="text-[10px] text-white/30 mt-1 font-bold">Select or drop files</p>
                    </div>

                    <div
                        style={{ height: GRID_H }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative w-full flex flex-col rounded-xl border-2 border-dashed transition-all duration-700 overflow-hidden",
                            isDragging
                                ? "border-primary bg-primary/10 scale-[1.01] shadow-[0_0_60px_rgba(var(--primary),0.1)]"
                                : "border-white/10 bg-white/1 hover:border-primary/30 hover:bg-white/3",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {/* Top 2 Tiles Aligned Content (208px) */}
                        <div style={{ height: TOP_SLICE_H }} className="flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                animate={{
                                    y: isDragging ? -12 : 0,
                                    scale: isDragging ? 1.1 : 1,
                                }}
                                className={cn(
                                    "mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-2xl transition-all duration-700",
                                    isDragging ? "bg-primary text-white scale-110" : "bg-white/5 text-white/40"
                                )}
                            >
                                <Upload className="h-6 w-6" />
                            </motion.div>

                            <p className="text-lg font-black tracking-tight text-white/90">
                                {isDragging ? "Release Files" : "Drag files here"}
                            </p>
                            <p className="mt-2 text-xs font-medium text-white/20 max-w-[180px] leading-relaxed">
                                Staged items appear in review
                            </p>
                        </div>

                        {/* Bottom Tile Aligned Action (100px) */}
                        <div style={{ height: BTM_SLICE_H }} className="flex items-center justify-center px-10 border-t border-white/5">
                            <input
                                type="file"
                                multiple={multiple}
                                accept={accept}
                                onChange={handleFileInput}
                                disabled={disabled || uploading}
                                className="absolute inset-0 cursor-pointer opacity-0"
                            />
                            <Button
                                className="w-full h-14 text-xs font-bold uppercase tracking-[0.2em] "
                                onClick={(e) => {
                                    e.preventDefault()
                                    const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement
                                    input?.click()
                                }}
                            >
                                Browse Files
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Column 3: Staged Files & Action (Review) */}
                <div className="w-full md:w-[28%] p-8 flex flex-col h-full">
                    <div className="h-10 flex flex-col justify-center mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/50">
                                    3. Review
                                </h3>
                                <p className="text-[10px] text-white/30 mt-1 font-bold">Staging queue</p>
                            </div>
                            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                                <span className="text-[10px] font-black text-primary">
                                    {uploadQueue.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: GRID_H }} className="flex flex-col">
                        {/* Upper Slice: List Container (208px) */}
                        <div style={{ height: TOP_SLICE_H }} className="flex flex-col mb-2 overflow-hidden rounded-4xl bg-white/2 border border-white/5 p-3">
                            <ScrollArea className="h-full pr-1">
                                <div className="space-y-2 pb-2">
                                    <AnimatePresence initial={false} mode="popLayout">
                                        {uploadQueue.length > 0 ? (
                                            uploadQueue.map((file) => (
                                                <FileListItem
                                                    key={file.id}
                                                    uploadFile={file}
                                                    onRemove={() => onRemove(file.id)}
                                                    onRename={(newName) => onRename(file.id, newName)}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-[160px] flex flex-col items-center justify-center text-center p-6 opacity-20">
                                                <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3">
                                                    <File className="h-4 w-4" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-tighter">Empty</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Bottom Slice: Action (100px) */}
                        <div style={{ height: BTM_SLICE_H }} className="flex items-center">
                            {uploadQueue.some(f => f.status === "pending") ? (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={onUpload}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary h-14 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_20px_40px_rgba(var(--primary),0.2)] transition-all"
                                >
                                    {uploading ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                            <Upload className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    {uploading ? "Processing..." : `Confirm Upload`}
                                </motion.button>
                            ) : (
                                <div className="w-full h-14 rounded-2xl border border-white/10 bg-white/2 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                                    Queue Empty
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Folder selector component (separate from upload card)
const FOLDER_TABS = [
    { value: "file", label: "📄 Files" },
    { value: "document", label: "📃 Docs" },
    { value: "image", label: "🖼️ Images" },
    { value: "video", label: "🎬 Videos" },
    { value: "custom", label: "✏️ Custom" },
]

export function FolderSelector({
    selectedFolder,
    onFolderChange,
    customFolder,
    onCustomFolderChange,
    disabled = false,
    variant = "horizontal",
}: {
    selectedFolder: string
    onFolderChange: (folder: string) => void
    customFolder: string
    onCustomFolderChange: (path: string) => void
    disabled?: boolean
    variant?: "horizontal" | "vertical"
}) {
    if (variant === "vertical") {
        return (
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    {/* Row 1: Files & Docs */}
                    {[FOLDER_TABS[0], FOLDER_TABS[1]].map(tab => {
                        const isActive = selectedFolder === tab.value
                        return (
                            <button
                                key={tab.value}
                                onClick={() => onFolderChange(tab.value)}
                                disabled={disabled}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 h-[100px] rounded-2xl text-xs font-black transition-all duration-300 border",
                                    isActive
                                        ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/5"
                                        : "bg-white/2 hover:bg-white/5 text-white/40 border-white/5"
                                )}
                            >
                                <span className="text-xl opacity-80">{tab.label.split(" ")[0]}</span>
                                <span className="uppercase tracking-widest">{tab.label.split(" ")[1]}</span>
                            </button>
                        )
                    })}

                    {/* Row 2: Images & Videos */}
                    {[FOLDER_TABS[2], FOLDER_TABS[3]].map(tab => {
                        const isActive = selectedFolder === tab.value
                        return (
                            <button
                                key={tab.value}
                                onClick={() => onFolderChange(tab.value)}
                                disabled={disabled}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 h-[100px] rounded-2xl text-xs font-black transition-all duration-300 border",
                                    isActive
                                        ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/5"
                                        : "bg-white/2 hover:bg-white/5 text-white/40 border-white/5"
                                )}
                            >
                                <span className="text-xl opacity-80">{tab.label.split(" ")[0]}</span>
                                <span className="uppercase tracking-widest">{tab.label.split(" ")[1]}</span>
                            </button>
                        )
                    })}

                    {/* Row 3: Custom & Input */}
                    <button
                        onClick={() => onFolderChange("custom")}
                        disabled={disabled}
                        className={cn(
                            "flex flex-col items-center justify-center gap-2 h-[100px] rounded-2xl text-xs font-black transition-all duration-300 border",
                            selectedFolder === "custom"
                                ? "bg-primary/10 text-primary border-primary/40 shadow-lg shadow-primary/5"
                                : "bg-white/2 hover:bg-white/5 text-white/40 border-white/5"
                        )}
                    >
                        <span className="text-xl opacity-80">✏️</span>
                        <span className="uppercase tracking-widest">Custom</span>
                    </button>

                    <div className="flex flex-col justify-center gap-2">
                        <Input
                            placeholder="path/to/dir"
                            value={customFolder}
                            onChange={(e) => {
                                onCustomFolderChange(e.target.value)
                                if (selectedFolder !== "custom") onFolderChange("custom")
                            }}
                            disabled={disabled}
                            className="h-full min-h-[100px] text-center text-xs bg-white/2 border-white/5 focus:bg-white/5 transition-all rounded-2xl placeholder:opacity-20"
                        />
                    </div>
                </div>


            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium">Upload to:</p>
            <Tabs value={selectedFolder} onValueChange={onFolderChange}>
                <TabsList className="grid w-full grid-cols-5 ">
                    {FOLDER_TABS.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="text-xs sm:text-sm"
                            disabled={disabled}
                        >
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="inline sm:hidden">{tab.label.split(" ")[0]}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Custom folder input */}
            {selectedFolder === "custom" && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <Input
                        placeholder="e.g., assets/images"
                        value={customFolder}
                        onChange={(e) => onCustomFolderChange(e.target.value)}
                        disabled={disabled}
                        className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Files will upload to: <code className="bg-muted px-1 py-0.5 rounded">
                            /{customFolder || "custom"}/
                        </code>
                    </p>
                </motion.div>
            )}
        </div>
    )
}

// File list item with rename capability
export function FileListItem({
    uploadFile,
    onRemove,
    onRename,
}: {
    uploadFile: UploadFile
    onRemove?: () => void
    onRename?: (newName: string) => void
}) {
    const [isRenaming, setIsRenaming] = useState(false)
    const [newName, setNewName] = useState(uploadFile.customName || uploadFile.file.name)

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split(".").pop()?.toLowerCase()

        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
            return <Image className="h-4 w-4" />
        }
        if (["mp4", "mov", "avi", "webm"].includes(ext || "")) {
            return <Video className="h-4 w-4" />
        }
        if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) {
            return <FileArchive className="h-4 w-4" />
        }
        if (["pdf", "doc", "docx", "txt"].includes(ext || "")) {
            return <FileText className="h-4 w-4" />
        }
        return <File className="h-4 w-4" />
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    const handleRename = () => {
        if (onRename && newName !== uploadFile.file.name) {
            onRename(newName)
        }
        setIsRenaming(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="group relative overflow-hidden rounded-lg border bg-card/50 backdrop-blur-sm"
        >
            <div className="flex items-center gap-3 p-3">
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
                    uploadFile.status === "completed" && "bg-green-500/10 text-green-500",
                    uploadFile.status === "error" && "bg-destructive/10 text-destructive",
                    uploadFile.status === "uploading" && "bg-blue-500/10 text-blue-500",
                    uploadFile.status === "pending" && "bg-muted text-muted-foreground"
                )}>
                    {uploadFile.status === "completed" ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        getFileIcon(uploadFile.customName || uploadFile.file.name)
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    {isRenaming ? (
                        <Input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename()
                                if (e.key === "Escape") {
                                    setNewName(uploadFile.customName || uploadFile.file.name)
                                    setIsRenaming(false)
                                }
                            }}
                            autoFocus
                            className="h-7 text-sm"
                        />
                    ) : (
                        <p className="truncate text-sm font-medium">
                            {uploadFile.customName || uploadFile.file.name}
                            {uploadFile.customName && uploadFile.customName !== uploadFile.file.name && (
                                <span className="text-xs text-muted-foreground ml-1">
                                    (was: {uploadFile.file.name})
                                </span>
                            )}
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                        {uploadFile.error && ` • ${uploadFile.error}`}
                    </p>

                    {uploadFile.status === "uploading" && (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${uploadFile.progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    )}
                </div>

                {uploadFile.status === "pending" && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onRename && !isRenaming && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsRenaming(true)}
                                className="h-8 w-8 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
                                title="Rename file"
                            >
                                <Edit2 className="h-4 w-4" />
                            </motion.button>
                        )}
                        {onRemove && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onRemove}
                                className="h-8 w-8 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </motion.button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
