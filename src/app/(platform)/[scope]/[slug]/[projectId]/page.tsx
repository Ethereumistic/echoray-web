"use client"

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    LayoutGrid,
    Table2,
    Columns3,
    Image as ImageIcon,
    Plus,
    Trash2,
    Loader2,
    Settings,
    ArrowLeft,
    Check,
    ExternalLink,
    MapPin,
    Calendar,
    DollarSign,
    Hash,
    Type,
    Mail,
    Phone,
    CheckSquare,
    AlignLeft,
    Star,
    Percent,
    Clock,
    Timer,
    List,
    ListChecks,
    CircleDot,
    Tags,
    ToggleLeft,
    File,
    User,
    GitBranch,
    Calculator,
    ScanLine,
    Palette,
    FileText,
    Link2,
    Lock,
    FolderOpen,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FieldSchemaEditor, FieldDefinition } from '@/components/projects/field-editor'
import { ProjectSettings } from '@/components/projects/project-settings'
import { useScopeContext } from '@/contexts/scope-context'

// Field schema interface for type safety (matches Convex projectFields type)
interface FieldSchema {
    fieldKey: string
    fieldName: string
    fieldType: string
    isRequired?: boolean
    placeholder?: string
    currencySymbol?: string
    options?: { color?: string; value: string; label: string }[]
}

// Record interface
interface ProjectRecord {
    _id: Id<"projectRecords">
    data?: Record<string, string | number | boolean>
}

// Extended field type icons
const FIELD_TYPE_ICONS: Record<string, React.ReactNode> = {
    text: <Type className="h-4 w-4" />,
    textarea: <AlignLeft className="h-4 w-4" />,
    richtext: <FileText className="h-4 w-4" />,
    url: <Link2 className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    phone: <Phone className="h-4 w-4" />,
    number: <Hash className="h-4 w-4" />,
    currency: <DollarSign className="h-4 w-4" />,
    percentage: <Percent className="h-4 w-4" />,
    rating: <Star className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    datetime: <Clock className="h-4 w-4" />,
    time: <Clock className="h-4 w-4" />,
    duration: <Timer className="h-4 w-4" />,
    select: <List className="h-4 w-4" />,
    multiselect: <ListChecks className="h-4 w-4" />,
    status: <CircleDot className="h-4 w-4" />,
    tags: <Tags className="h-4 w-4" />,
    checkbox: <CheckSquare className="h-4 w-4" />,
    toggle: <ToggleLeft className="h-4 w-4" />,
    location: <MapPin className="h-4 w-4" />,
    file: <File className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    user: <User className="h-4 w-4" />,
    relation: <GitBranch className="h-4 w-4" />,
    formula: <Calculator className="h-4 w-4" />,
    autonumber: <Hash className="h-4 w-4" />,
    barcode: <ScanLine className="h-4 w-4" />,
    color: <Palette className="h-4 w-4" />,
}

// View type options
const VIEW_TYPES = [
    { value: "table", label: "Table", icon: Table2, description: "Spreadsheet-like rows and columns" },
    { value: "kanban", label: "Kanban", icon: Columns3, description: "Drag-and-drop columns" },
    { value: "cards", label: "Cards", icon: LayoutGrid, description: "Grid of visual cards" },
    { value: "gallery", label: "Gallery", icon: ImageIcon, description: "Image-focused grid" },
]

/**
 * Unified Project Detail page for both personal (p) and organization (o) scopes.
 * Route: /p/[userId]/[projectId] or /o/[orgId]/[projectId]
 */
export default function ProjectDetailPage() {
    const { scope, slug } = useScopeContext()
    const params = useParams()
    const projectId = params.projectId as string

    // Fetch project data - now returns { project, error }
    const projectResult = useQuery(
        api.projects.getProject,
        { id: projectId as Id<"projects"> }
    )
    const project = projectResult?.project
    const projectError = projectResult?.error

    const projectData = useQuery(
        api.projects.getProjectRecords,
        project ? { projectId: project._id } : "skip"
    )

    // Mutations
    const saveFieldSchema = useMutation(api.projects.saveFieldSchema)
    const completeSetup = useMutation(api.projects.completeProjectSetup)
    const createRecord = useMutation(api.projects.createRecord)
    const deleteRecord = useMutation(api.projects.deleteRecord)

    // Setup flow state
    const [setupStep, setSetupStep] = useState(1)
    const [selectedViewType, setSelectedViewType] = useState<string>("table")
    const [fields, setFields] = useState<FieldDefinition[]>([
        { fieldKey: "field1", fieldName: "", fieldType: "text" },
    ])
    const [isSaving, setIsSaving] = useState(false)

    // Record form state
    const [isAddingRecord, setIsAddingRecord] = useState(false)
    const [newRecordData, setNewRecordData] = useState<Record<string, string | number | boolean>>({})

    // Settings dialog state
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    // Error states - show UI message instead of crashing
    if (projectError === "not_authorized" || projectError === "not_member") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="rounded-full bg-destructive/10 p-4">
                    <Lock className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    You don&apos;t have permission to view this project.
                    This may be a private project or you may not be a member of the organization that owns it.
                </p>
                <Link href={`/${scope}/${slug}/projects`}>
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Button>
                </Link>
            </div>
        )
    }

    if (projectError === "not_found") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="rounded-full bg-muted p-4">
                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold">Project Not Found</h2>
                <p className="text-muted-foreground text-center max-w-md">
                    This project doesn&apos;t exist or may have been deleted.
                </p>
                <Link href={`/${scope}/${slug}/projects`}>
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Button>
                </Link>
            </div>
        )
    }

    // Loading state (still fetching or no error yet but no project)
    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Check if setup is complete
    const isSetupComplete = project.isSetupComplete

    // =========================================================================
    // SETUP FLOW (for new projects)
    // =========================================================================

    const handleCompleteSetup = async () => {
        // Validate fields
        const validFields = fields.filter(f => f.fieldName.trim())
        if (validFields.length === 0) {
            alert("Please add at least one field")
            return
        }

        setIsSaving(true)
        try {
            // Save field schema
            await saveFieldSchema({
                projectId: project._id,
                fields: validFields.map((f, i) => ({
                    fieldKey: `field${i + 1}`,
                    fieldName: f.fieldName.trim(),
                    fieldType: f.fieldType,
                    subTypes: f.subTypes,
                    simpleOptions: f.simpleOptions,
                    isRequired: f.isRequired,
                    currencySymbol: f.currencySymbol,
                    placeholder: f.placeholder,
                })),
            })

            // Complete setup
            await completeSetup({
                projectId: project._id,
                defaultView: selectedViewType as "table" | "kanban" | "cards" | "gallery",
            })
        } catch (error) {
            console.error("Setup error:", error)
            alert(error instanceof Error ? error.message : "Failed to complete setup")
        } finally {
            setIsSaving(false)
        }
    }

    // =========================================================================
    // RECORD MANAGEMENT
    // =========================================================================

    const handleAddRecord = async () => {
        try {
            await createRecord({
                projectId: project._id,
                data: newRecordData,
            })
            setNewRecordData({})
            setIsAddingRecord(false)
        } catch (error) {
            console.error("Error adding record:", error)
            alert(error instanceof Error ? error.message : "Failed to add record")
        }
    }

    const handleDeleteRecord = async (recordId: Id<"projectRecords">) => {
        if (!confirm("Are you sure you want to delete this record?")) return
        try {
            await deleteRecord({ id: recordId })
        } catch (error) {
            console.error("Error deleting record:", error)
        }
    }

    // =========================================================================
    // RENDER SETUP FLOW
    // =========================================================================

    if (!isSetupComplete) {
        return (
            <div className="flex flex-col">
                <DashboardHeader
                    title={project.name}
                    description="Set up your project"
                />

                <main className="flex-1 p-6 space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`flex items-center gap-2 ${setupStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${setupStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {setupStep > 1 ? <Check className="h-4 w-4" /> : '1'}
                            </div>
                            <span className="font-medium">Choose View</span>
                        </div>
                        <div className="flex-1 h-px bg-border" />
                        <div className={`flex items-center gap-2 ${setupStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${setupStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {setupStep > 2 ? <Check className="h-4 w-4" /> : '2'}
                            </div>
                            <span className="font-medium">Define Fields</span>
                        </div>
                    </div>

                    {/* Step 1: Choose View Type */}
                    {setupStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">How would you like to visualize your data?</h2>
                                <p className="text-muted-foreground">Choose a view type. You can always change this later or add more views.</p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {VIEW_TYPES.map((type) => (
                                    <Card
                                        key={type.value}
                                        className={`cursor-pointer transition-all hover:border-primary/50 ${selectedViewType === type.value ? 'border-primary ring-2 ring-primary/20' : ''}`}
                                        onClick={() => setSelectedViewType(type.value)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${selectedViewType === type.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    <type.icon className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{type.label}</CardTitle>
                                                    <CardDescription className="text-xs">{type.description}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setSetupStep(2)}>
                                    Next: Define Fields
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Define Fields */}
                    {setupStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Define your data fields</h2>
                                    <p className="text-muted-foreground">Add the fields you need. Select a type and the name will auto-fill. Click on types like &quot;Location&quot; for sub-options.</p>
                                </div>
                                <Button variant="outline" onClick={() => setSetupStep(1)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="pt-6">
                                    <FieldSchemaEditor
                                        fields={fields}
                                        onChange={setFields}
                                    />
                                </CardContent>

                                <CardFooter className="justify-end gap-4 border-t pt-6">
                                    <Button
                                        onClick={handleCompleteSetup}
                                        disabled={isSaving || fields.every(f => !f.fieldName.trim())}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Complete Setup
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}
                </main>
            </div>
        )
    }

    // =========================================================================
    // RENDER MAIN PROJECT WORKSPACE
    // =========================================================================

    const schema = projectData?.schema || []
    const records = projectData?.records || []
    const currentView = project.defaultView || "table"

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title={project.name}
                description={project.description || `${records.length} records`}
            />

            <main className="flex-1 p-6 space-y-6">
                {/* Action Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href={`/${scope}/${slug}/projects`}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Projects
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                        <Button onClick={() => setIsAddingRecord(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Record
                        </Button>
                    </div>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-2 border-b pb-2">
                    {VIEW_TYPES.filter(v => v.value === currentView).map((type) => (
                        <Button
                            key={type.value}
                            variant="ghost"
                            size="sm"
                            className="border-b-2 border-primary rounded-none"
                        >
                            <type.icon className="mr-2 h-4 w-4" />
                            {type.label}
                        </Button>
                    ))}
                </div>

                {/* Data View */}
                {currentView === "table" && (
                    <TableView
                        schema={schema}
                        records={records}
                        onDelete={handleDeleteRecord}
                    />
                )}

                {currentView === "cards" && (
                    <CardsView
                        schema={schema}
                        records={records}
                        onDelete={handleDeleteRecord}
                    />
                )}

                {currentView === "kanban" && (
                    <KanbanView
                        schema={schema}
                        records={records}
                        onDelete={handleDeleteRecord}
                    />
                )}

                {records.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Plus className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No records yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Add your first record to get started
                            </p>
                            <Button onClick={() => setIsAddingRecord(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Record
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* Add Record Dialog */}
            <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Record</DialogTitle>
                        <DialogDescription>
                            Fill in the fields to create a new record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                        {schema.map((field) => (
                            <div key={field.fieldKey} className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    {FIELD_TYPE_ICONS[field.fieldType]}
                                    {field.fieldName}
                                    {field.isRequired && <span className="text-destructive">*</span>}
                                </Label>
                                <DynamicFieldInput
                                    field={field}
                                    value={newRecordData[field.fieldKey] || ''}
                                    onChange={(value) => setNewRecordData({
                                        ...newRecordData,
                                        [field.fieldKey]: value
                                    })}
                                />
                            </div>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingRecord(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddRecord}>
                            Add Record
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Project Settings Dialog */}
            <ProjectSettings
                project={project}
                schema={schema}
                recordCount={records.length}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    )
}

// =========================================================================
// HELPER HOOK
// =========================================================================

function useProjectId() {
    // Get projectId from URL params - it's the last segment after [slug]
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const segments = pathname.split('/').filter(Boolean)
    // URL: /{scope}/{slug}/{projectId}
    return segments[2] || ''
}

// =========================================================================
// DYNAMIC FIELD INPUT COMPONENT
// =========================================================================

function DynamicFieldInput({
    field,
    value,
    onChange
}: {
    field: FieldSchema
    value: unknown
    onChange: (value: string | number | boolean) => void
}) {
    switch (field.fieldType) {
        case 'textarea':
            return (
                <Textarea
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                />
            )
        case 'date':
            return (
                <Input
                    type="date"
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                />
            )
        case 'number':
        case 'currency':
            return (
                <Input
                    type="number"
                    step="0.01"
                    value={typeof value === 'number' ? value : ''}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    placeholder={field.placeholder}
                />
            )
        case 'checkbox':
            return (
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    className="h-4 w-4"
                />
            )
        case 'select':
            return (
                <Select value={String(value ?? '')} onValueChange={onChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        case 'url':
        case 'email':
            return (
                <Input
                    type={field.fieldType === 'email' ? 'email' : 'url'}
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || (field.fieldType === 'url' ? 'https://...' : 'email@example.com')}
                />
            )
        default:
            return (
                <Input
                    type="text"
                    value={String(value ?? '')}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                />
            )
    }
}

// =========================================================================
// VIEW COMPONENTS
// =========================================================================

function TableView({
    schema,
    records,
    onDelete
}: {
    schema: FieldSchema[]
    records: ProjectRecord[]
    onDelete: (id: Id<"projectRecords">) => void
}) {
    if (records.length === 0) return null

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {schema.map((field) => (
                            <TableHead key={field.fieldKey}>
                                <div className="flex items-center gap-2">
                                    {FIELD_TYPE_ICONS[field.fieldType]}
                                    {field.fieldName}
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record._id}>
                            {schema.map((field) => (
                                <TableCell key={field.fieldKey}>
                                    <CellDisplay
                                        field={field}
                                        value={record.data?.[field.fieldKey]}
                                    />
                                </TableCell>
                            ))}
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete(record._id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function CardsView({
    schema,
    records,
    onDelete
}: {
    schema: FieldSchema[]
    records: ProjectRecord[]
    onDelete: (id: Id<"projectRecords">) => void
}) {
    if (records.length === 0) return null

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
                <Card key={record._id} className="group hover:border-primary/50 transition-colors">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                        <CardTitle className="text-base">
                            {record.data?.[schema[0]?.fieldKey] || 'Untitled'}
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(record._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {schema.slice(1).map((field) => (
                            <div key={field.fieldKey} className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                    {FIELD_TYPE_ICONS[field.fieldType]}
                                    {field.fieldName}:
                                </span>
                                <CellDisplay
                                    field={field}
                                    value={record.data?.[field.fieldKey]}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function KanbanView({
    schema,
    records,
    onDelete
}: {
    schema: FieldSchema[]
    records: ProjectRecord[]
    onDelete: (id: Id<"projectRecords">) => void
}) {
    // Group by first select field, or just show all in one column
    const groupByField = schema.find(f => f.fieldType === 'select')

    const grouped = useMemo(() => {
        if (!groupByField) {
            return { 'All Records': records }
        }

        return records.reduce((acc: Record<string, ProjectRecord[]>, record) => {
            const groupValue = String(record.data?.[groupByField.fieldKey] || 'Uncategorized')
            if (!acc[groupValue]) acc[groupValue] = []
            acc[groupValue].push(record)
            return acc
        }, {})
    }, [records, groupByField])

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(grouped).map(([groupName, groupRecords]) => (
                <div key={groupName} className="shrink-0 w-72">
                    <div className="bg-muted/30 rounded-lg p-4">
                        <h3 className="font-semibold mb-4 flex items-center justify-between">
                            {groupName}
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                                {groupRecords.length}
                            </span>
                        </h3>
                        <div className="space-y-2">
                            {groupRecords.map((record: ProjectRecord) => (
                                <Card key={record._id} className="group cursor-move">
                                    <CardContent className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="font-medium text-sm">
                                                {record.data?.[schema[0]?.fieldKey] || 'Untitled'}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                onClick={() => onDelete(record._id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {schema.length > 1 && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {schema.slice(1, 3).map((field) => (
                                                    <div key={field.fieldKey} className="truncate">
                                                        {field.fieldName}: {record.data?.[field.fieldKey] || '-'}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function CellDisplay({ field, value }: { field: FieldSchema; value: unknown }) {
    if (value === undefined || value === null || value === '') {
        return <span className="text-muted-foreground">-</span>
    }

    switch (field.fieldType) {
        case 'url':
            return (
                <a
                    href={String(value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                >
                    {String(value).replace(/^https?:\/\//, '').split('/')[0]}
                    <ExternalLink className="h-3 w-3" />
                </a>
            )
        case 'currency':
            return <span>{field.currencySymbol || '€'}{Number(value).toFixed(2)}</span>
        case 'checkbox':
            return value ? <Check className="h-4 w-4 text-green-500" /> : <span>-</span>
        case 'date':
            return <span>{new Date(String(value)).toLocaleDateString()}</span>
        default:
            return <span>{String(value)}</span>
    }
}
