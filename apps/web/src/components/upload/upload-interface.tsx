"use client"

import { useState } from "react"
import { useMutation, useQuery, useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@echoray/ui/components/ui/card"
import { Button } from "@echoray/ui/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@echoray/ui/components/ui/select"
import { Input } from "@echoray/ui/components/ui/input"
import { Loader2, XCircle, AlertCircle, FolderOpen, File, Copy, Trash2, Filter, SortAsc, SortDesc } from "lucide-react"
import { toast } from "sonner"
import { fileToBase64, uploadToGitHub } from "@echoray/utils/file-upload"
import { UploadCard, FileListItem, UploadFile, FolderSelector } from "@echoray/ui/components/ui/upload-card"
import { motion, AnimatePresence } from "framer-motion"

interface UploadInterfaceProps {
    repoId: Id<"repos">
    repoStatus: "pending" | "active" | "failed"
}

const MAX_FILE_SIZE = 19.9 * 1024 * 1024

type SortField = "name" | "date" | "size"
type SortOrder = "asc" | "desc"

export function UploadInterface({ repoId, repoStatus }: UploadInterfaceProps) {
    const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([])
    const [uploading, setUploading] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState("file")
    const [customFolder, setCustomFolder] = useState("")

    // File browser filters
    const [folderFilter, setFolderFilter] = useState<string>("all")
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
    const [searchQuery, setSearchQuery] = useState("")

    const prepareUpload = useAction(api.uploads.prepareUpload)
    const completeUpload = useMutation(api.uploads.completeUpload)
    const updateProgress = useMutation(api.uploads.updateUploadProgress)

    const uploads = useQuery(api.uploads.getUserUploads, { repoId })

    const handleFilesSelected = (files: File[]) => {
        const newFiles: UploadFile[] = files.map(file => ({
            file,
            id: crypto.randomUUID(),
            progress: 0,
            status: "pending" as const,
        }))
        setUploadQueue(prev => [...prev, ...newFiles])
    }

    const removeFromQueue = (id: string) => {
        setUploadQueue(prev => prev.filter(f => f.id !== id))
    }

    const renameFileInQueue = (id: string, newName: string) => {
        setUploadQueue(prev => prev.map(f =>
            f.id === id ? { ...f, customName: newName } : f
        ))
    }

    const uploadFiles = async () => {
        if (uploadQueue.length === 0 || uploading) return

        const targetFolder = selectedFolder === "custom" && customFolder ? customFolder : selectedFolder

        setUploading(true)

        for (const uploadFile of uploadQueue) {
            if (uploadFile.status !== "pending") continue

            try {
                setUploadQueue(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
                ))

                let uploadData: {
                    uploadId: Id<"uploads">
                    githubToken: string
                    owner: string
                    repo: string
                    branch: string
                    filePath: string
                } | null = null

                const fileName = uploadFile.customName || uploadFile.file.name

                uploadData = await prepareUpload({
                    repoId,
                    fileName,
                    fileType: "file",
                    fileSize: uploadFile.file.size,
                    mimeType: uploadFile.file.type || "application/octet-stream",
                    customFolder: targetFolder,
                })

                const base64Content = await fileToBase64(uploadFile.file, (readProgress) => {
                    if (!uploadData) return
                    const percent = Math.round(readProgress * 30)
                    setUploadQueue(prev => prev.map(f =>
                        f.id === uploadFile.id ? { ...f, progress: percent } : f
                    ))
                    updateProgress({
                        uploadId: uploadData.uploadId,
                        progress: percent,
                    }).catch(() => { })
                })

                const githubResponse = await uploadToGitHub({
                    owner: uploadData!.owner,
                    repo: uploadData!.repo,
                    branch: uploadData!.branch,
                    path: uploadData!.filePath,
                    content: base64Content,
                    message: `Upload ${fileName}`,
                    token: uploadData!.githubToken,
                    onProgress: (uploadProgress) => {
                        if (!uploadData) return
                        const percent = 30 + Math.round(uploadProgress * 70)
                        setUploadQueue(prev => prev.map(f =>
                            f.id === uploadFile.id ? { ...f, progress: percent } : f
                        ))
                        updateProgress({
                            uploadId: uploadData.uploadId,
                            progress: percent,
                        }).catch(() => { })
                    },
                })

                await completeUpload({
                    uploadId: uploadData!.uploadId,
                    githubCommitSha: githubResponse.commit.sha,
                })

                setUploadQueue(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: "completed" as const, progress: 100 } : f
                ))

                toast.success(`${fileName} uploaded successfully!`)

            } catch (error) {
                console.error("Upload error:", error)
                const errorMessage = error instanceof Error ? error.message : "Upload failed"

                setUploadQueue(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: "error" as const, error: errorMessage } : f
                ))

                toast.error(`Failed to upload ${uploadFile.customName || uploadFile.file.name}`)
            }
        }

        setUploading(false)

        setTimeout(() => {
            setUploadQueue(prev => prev.filter(f => f.status === "pending" || f.status === "uploading"))
        }, 3000)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("CDN URL copied to clipboard!")
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "Unknown"
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString()
    }

    const folders = Array.from(new Set(uploads?.map((u: { filePath: string }) => u.filePath.split("/")[0]) || [])) as string[]

    const filteredUploads = uploads?.filter((upload: { filePath: string; fileName: string }) => {
        if (folderFilter !== "all") {
            const uploadFolder = upload.filePath.split("/")[0]
            if (uploadFolder !== folderFilter) return false
        }

        if (searchQuery) {
            return upload.fileName.toLowerCase().includes(searchQuery.toLowerCase())
        }

        return true
    }).sort((a: { fileName: string; uploadedAt: number; fileSize?: number }, b: { fileName: string; uploadedAt: number; fileSize?: number }) => {
        let comparison = 0

        if (sortField === "name") {
            comparison = a.fileName.localeCompare(b.fileName)
        } else if (sortField === "date") {
            comparison = a.uploadedAt - b.uploadedAt
        } else if (sortField === "size") {
            comparison = (a.fileSize || 0) - (b.fileSize || 0)
        }

        return sortOrder === "asc" ? comparison : -comparison
    })

    const isRepoReady = repoStatus === "active"

    return (
        <div className="space-y-6">
            {repoStatus === "pending" && (
                <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                        <div>
                            <p className="font-medium text-amber-500">Repository Initializing</p>
                            <p className="text-sm text-muted-foreground">Setting up GitHub repository...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {repoStatus === "failed" && (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 pt-6">
                        <XCircle className="h-5 w-5 text-destructive" />
                        <div>
                            <p className="font-medium text-destructive">Repository Setup Failed</p>
                            <p className="text-sm text-muted-foreground">Failed to create GitHub repository.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isRepoReady && (
                <div className="space-y-6">
                    <UploadCard
                        selectedFolder={selectedFolder}
                        onFolderChange={setSelectedFolder}
                        customFolder={customFolder}
                        onCustomFolderChange={setCustomFolder}
                        uploadQueue={uploadQueue}
                        onRemove={removeFromQueue}
                        onRename={renameFileInQueue}
                        onUpload={uploadFiles}
                        uploading={uploading}
                        onFilesSelected={handleFilesSelected}
                        maxFileSize={MAX_FILE_SIZE}
                        multiple={true}
                        disabled={!isRepoReady}
                    />
                </div>
            )}

            {!isRepoReady && (
                <Card>
                    <CardContent className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <p>Repository is not ready yet...</p>
                    </CardContent>
                </Card>
            )}

            {isRepoReady && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <FolderOpen className="h-5 w-5" />
                                    Uploaded Files
                                </CardTitle>
                                <CardDescription>
                                    {filteredUploads?.length || 0} file(s) {folderFilter !== "all" && `in ${folderFilter}`}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {uploads && uploads.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                <Input
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="max-w-xs"
                                />

                                <Select value={folderFilter} onValueChange={setFolderFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <Filter className="mr-2 h-4 w-4" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Folders</SelectItem>
                                        {folders.map((folder: string) => (
                                            <SelectItem key={folder} value={folder}>
                                                📁 {folder}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                                    const [field, order] = value.split("-") as [SortField, SortOrder]
                                    setSortField(field)
                                    setSortOrder(order)
                                }}>
                                    <SelectTrigger className="w-[180px]">
                                        {sortOrder === "asc" ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="date-desc">Newest First</SelectItem>
                                        <SelectItem value="date-asc">Oldest First</SelectItem>
                                        <SelectItem value="size-desc">Largest First</SelectItem>
                                        <SelectItem value="size-asc">Smallest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {filteredUploads && filteredUploads.length > 0 ? (
                            <div className="space-y-2">
                                {filteredUploads.map((upload: { _id: string; fileName: string; filePath: string; fileSize?: number; uploadedAt: number; cdnUrl?: string }) => (
                                    <motion.div
                                        key={upload._id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex items-center gap-3 rounded-lg border bg-card/50 p-3 hover:bg-accent/50"
                                    >
                                        <File className="h-8 w-8 text-muted-foreground" />

                                        <div className="flex-1 min-w-0">
                                            <p className="truncate font-medium">{upload.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                📁 {upload.filePath.split("/")[0]} • {formatFileSize(upload.fileSize)} • {formatDate(upload.uploadedAt)}
                                            </p>
                                        </div>

                                        {upload.cdnUrl && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(upload.cdnUrl!)}
                                                className="opacity-0 group-hover:opacity-100"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ) : uploads && uploads.length > 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Filter className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-sm text-muted-foreground">No files match your filters</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-sm text-muted-foreground">No files uploaded yet!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {(repoStatus === "active" || repoStatus === "failed") && (
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Permanently delete and reinitialize repository</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            This will delete the GitHub repository and all files.
                        </p>
                        <ResetRepositoryButton repoId={repoId} />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function ResetRepositoryButton({ repoId }: { repoId: Id<"repos"> }) {
    const [confirming, setConfirming] = useState(false)
    const [resetting, setResetting] = useState(false)
    const resetRepo = useMutation(api.repos.resetRepository)

    const handleReset = async () => {
        setResetting(true)
        try {
            await resetRepo({ repoId })
            toast.success("Repository reset! Reloading...")
            setTimeout(() => window.location.reload(), 1000)
        } catch {
            toast.error("Failed to reset repository")
        } finally {
            setResetting(false)
            setConfirming(false)
        }
    }

    if (!confirming) {
        return (
            <Button variant="destructive" onClick={() => setConfirming(true)} className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Reset Repository
            </Button>
        )
    }

    return (
        <div className="space-y-3 p-4 border border-destructive rounded-lg bg-destructive/5">
            <p className="text-sm font-medium text-destructive">Are you sure?</p>
            <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReset} disabled={resetting} className="flex-1">
                    {resetting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Yes, delete"}
                </Button>
                <Button variant="outline" onClick={() => setConfirming(false)} disabled={resetting} className="flex-1">
                    Cancel
                </Button>
            </div>
        </div>
    )
}
