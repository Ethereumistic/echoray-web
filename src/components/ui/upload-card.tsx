"use client"

import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, FileText, Image, Video, FileArchive, Check, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

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

    return (
        <div
            className={cn(
                "overflow-hidden rounded-2xl border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl ",
                className
            )}
            {...props}
        >
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {/* Column 1: Destination Selector (3/12) */}
                <div className="md:col-span-3 p-6 bg-muted/20">
                    <div className="flex flex-col h-full">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                                1. Destination
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">Select where files will be stored</p>
                        </div>

                        <div className="flex-1">
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
                </div>

                {/* Column 2: Upload Area (5/12) */}
                <div className="md:col-span-5 p-8 relative flex flex-col items-center justify-center min-h-[300px]">
                    <div className="mb-6 text-center w-full absolute top-8">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                            2. Source
                        </h3>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                            "relative w-full h-full mt-12 pb- flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300",
                            isDragging
                                ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                                : "border-border/60 hover:border-primary/50 hover:bg-primary/5",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <motion.div
                            animate={{
                                y: isDragging ? -10 : 0,
                                scale: isDragging ? 1.1 : 1,
                            }}
                            className={cn(
                                "mb-4 rounded-full p-5 shadow-lg transition-colors duration-300",
                                isDragging ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                            )}
                        >
                            <Upload className="h-10 w-10" />
                        </motion.div>

                        <div className="text-center px-4">
                            <p className="text-base font-medium">
                                {isDragging ? "Release to stage files" : "Drag & drop files"}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                or click to browse files
                            </p>
                        </div>

                        <input
                            type="file"
                            multiple={multiple}
                            accept={accept}
                            onChange={handleFileInput}
                            disabled={disabled || uploading}
                            className="absolute inset-0 cursor-pointer opacity-0"
                            aria-label="Upload files"
                        />

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={disabled || uploading}
                            className="mt-6 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50"
                            onClick={(e) => {
                                e.preventDefault()
                                const input = e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement
                                input?.click()
                            }}
                        >
                            Browse Device
                        </motion.button>
                    </div>
                </div>

                {/* Column 3: Staged Files & Action (4/12) */}
                <div className="md:col-span-4 p-6 flex flex-col bg-muted/10 h-full">
                    <div className="mb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                                3. Review
                            </h3>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                {uploadQueue.length} files
                            </span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 -mr-2 pr-4">
                        <div className="space-y-3 pb-4">
                            <AnimatePresence initial={false}>
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
                                    <div className="p-16 mt-8 flex flex-col items-center justify-center text-center border border-dashed rounded-xl border-border/40">
                                        <File className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                        <p className="text-sm text-muted-foreground">No files staged yet</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Files you drag or browse will appear here</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>

                    <div className="mt-6 pt-6 border-t border-border/50">
                        {uploadQueue.some(f => f.status === "pending") && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onUpload}
                                disabled={uploading || uploadQueue.length === 0}
                                className="w-full flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary to-primary/80 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 disabled:opacity-50 disabled:grayscale"
                            >
                                {uploading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </motion.div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Submit {uploadQueue.filter(f => f.status === "pending").length} Files
                                    </>
                                )}
                            </motion.button>
                        )}

                        {uploadQueue.length > 0 && !uploadQueue.some(f => f.status === "pending") && !uploading && (
                            <div className="text-center py-2 text-sm text-green-500 font-medium flex items-center justify-center gap-2">
                                <Check className="h-4 w-4" /> All files processed
                            </div>
                        )}
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
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-[11px] font-bold transition-all duration-300 border",
                                    isActive
                                        ? "bg-primary/10 text-primary border-primary/50 shadow-lg shadow-primary/5"
                                        : "bg-background/40 hover:bg-background/60 text-muted-foreground border-border/30"
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
                                    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-[11px] font-bold transition-all duration-300 border",
                                    isActive
                                        ? "bg-primary/10 text-primary border-primary/50 shadow-lg shadow-primary/5"
                                        : "bg-background/40 hover:bg-background/60 text-muted-foreground border-border/30"
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
                            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-[11px] font-bold transition-all duration-300 border",
                            selectedFolder === "custom"
                                ? "bg-primary/10 text-primary border-primary/50 shadow-lg shadow-primary/5"
                                : "bg-background/40 hover:bg-background/60 text-muted-foreground border-border/30"
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
                            className="h-full min-h-[42px] text-xs bg-muted/40 border-border/30 focus:bg-background transition-all rounded-xl placeholder:text-center"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1.5 px-1 text-[9px] text-muted-foreground italic opacity-60">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    Target: /{selectedFolder === "custom" ? (customFolder || "custom") : selectedFolder}/
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
