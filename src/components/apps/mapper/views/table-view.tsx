"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FieldDisplay } from "../field-types/field-display";
import { FieldInput } from "../field-types/field-input";
import { FieldTypeSelector } from "../field-type-selector";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Save, Database, Plus, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { FieldType } from "@/lib/mapper/field-types";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
interface TableViewProps {
    projectId: string;
    template: {
        fields: Array<{ id: string; name: string; type: string; required: boolean; order: number; config?: unknown }>;
    };
    scope: string;
    slug: string;
    searchQuery?: string;
    isAddingRow?: boolean;
    setIsAddingRow?: (val: boolean) => void;
}

interface MapperField {
    id: string;
    name: string;
    type: string;
    required: boolean;
    order: number;
    config?: unknown;
}

interface MapperCard {
    _id?: Id<"mapping_cards">;
    id?: string;
    projectId: Id<"mapping_projects">;
    values: Record<string, unknown>;
    order: number;
    isDeleted?: boolean;
}

interface SortableHeaderProps {
    field: { id: string; name: string; required: boolean };
    sortConfig: { fieldId: string | null; direction: "asc" | "desc" };
    onSort: (fieldId: string) => void;
    width?: number;
    onResize: (fieldId: string, width: number) => void;
}

const SortableHeader = ({ field, sortConfig, onSort, width, onResize }: SortableHeaderProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    const isSorted = sortConfig.fieldId === field.id;
    const headerRef = useRef<HTMLTableCellElement | null>(null);

    const mergedRef = (node: HTMLTableCellElement | null) => {
        setNodeRef(node);
        headerRef.current = node;
    };

    return (
        <TableHead
            ref={mergedRef}
            style={{
                ...style,
                width: width ? `${width}px` : 'auto',
                minWidth: width ? `${width}px` : '150px',
                maxWidth: width ? `${width}px` : 'none',
            }}
            className="font-semibold border-r p-0 group relative select-none"
        >
            <div className="flex items-center h-full overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="p-1 cursor-grab active:cursor-grabbing hover:bg-accent rounded ml-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div
                    className="flex-1 px-2 py-2 truncate cursor-pointer hover:bg-accent/50 flex items-center justify-between h-full min-h-[40px] overflow-hidden"
                    onClick={() => onSort(field.id)}
                >
                    <span className="truncate">
                        {field.name}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                    </span>
                    {isSorted && (
                        sortConfig.direction === "asc" ? <ArrowUp className="w-3.5 h-3.5 ml-1 shrink-0" /> : <ArrowDown className="w-3.5 h-3.5 ml-1 shrink-0" />
                    )}
                </div>

                {/* Resize Handle */}
                <div
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary transition-colors z-20"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        document.body.style.cursor = 'col-resize';
                        document.body.style.userSelect = 'none';

                        const startX = e.clientX;
                        const startWidth = headerRef.current?.offsetWidth || 150;

                        const onMouseMove = (moveEvent: MouseEvent) => {
                            const currentWidth = Math.max(80, startWidth + (moveEvent.clientX - startX));
                            onResize(field.id, currentWidth);
                        };

                        const onMouseUp = () => {
                            document.body.style.cursor = '';
                            document.body.style.userSelect = '';
                            window.removeEventListener('mousemove', onMouseMove);
                            window.removeEventListener('mouseup', onMouseUp);
                        };

                        window.addEventListener('mousemove', onMouseMove);
                        window.addEventListener('mouseup', onMouseUp);
                    }}
                />
            </div>
        </TableHead>
    );
};

export function TableView({
    projectId,
    template,
    scope,
    slug,
    searchQuery = "",
    isAddingRow,
    setIsAddingRow,
}: TableViewProps) {
    const cards = useQuery(api.mapping.cards.list, {
        projectId: projectId as Id<"mapping_projects">,
        includeArchived: false,
    });

    const syncData = useMutation(api.mapping.cards.sync);

    // Local buffers for unsaved changes
    const [bufferedCards, setBufferedCards] = useState<MapperCard[]>([]);
    const [bufferedFields, setBufferedFields] = useState<MapperField[]>([]);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Track which cell is active
    const [activeCell, setActiveCell] = useState<string | null>(null);

    const inputRef = useRef<HTMLDivElement>(null);

    // Initialize/Sync buffers from database
    useEffect(() => {
        if (cards && !isDirty) {
            setBufferedCards(cards.map(c => ({ ...c })));
        }
    }, [cards, isDirty]);

    useEffect(() => {
        if (template.fields && !isDirty) {
            setBufferedFields(template.fields.map(f => ({
                ...f,
                type: f.type.toString(),
                config: f.config ?? {}
            } as MapperField)));
        }
    }, [template.fields, isDirty]);

    // Add column dialog state
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newFieldType, setNewFieldType] = useState<FieldType | null>(null);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldRequired, setNewFieldRequired] = useState(false);

    // Filter/Sort state
    const [sortConfig, setSortConfig] = useState<{ fieldId: string | null; direction: "asc" | "desc" }>({
        fieldId: null,
        direction: "asc",
    });

    // Drag to add rows state
    const [isDraggingRow, setIsDraggingRow] = useState(false);
    const [rowDragY, setRowDragY] = useState(0);
    const [pendingRows, setPendingRows] = useState(0);
    const rowBarRef = useRef<HTMLDivElement>(null);
    const rowDragStart = useRef({ x: 0, y: 0 });
    const colDragStart = useRef({ x: 0, y: 0 });
    const dragRowsSnapshot = useRef<MapperCard[]>([]);
    const dragColsSnapshot = useRef<MapperField[]>([]);
    const dragColsOrderSnapshot = useRef<string[]>([]);

    // Hover states for popovers
    const [isHoveredRow, setIsHoveredRow] = useState(false);
    const [isHoveredCol, setIsHoveredCol] = useState(false);

    // Drag to add columns state
    const [isDraggingCol, setIsDraggingCol] = useState(false);
    const [colDragX, setColDragX] = useState(0);
    const [pendingCols, setPendingCols] = useState(0);
    const colBarRef = useRef<HTMLDivElement>(null);

    // Column order state
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

    // Load column widths
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(`mapper_${projectId}_columnWidths`);
            if (stored) {
                try {
                    setColumnWidths(JSON.parse(stored));
                } catch (e) {
                    console.error("Error parsing stored column widths", e);
                }
            }
        }
    }, [projectId]);

    const handleResize = (fieldId: string, width: number) => {
        setColumnWidths(prev => {
            const next = { ...prev, [fieldId]: width };
            if (typeof window !== 'undefined') {
                localStorage.setItem(`mapper_${projectId}_columnWidths`, JSON.stringify(next));
            }
            return next;
        });
    };

    const handleAddRow = () => {
        const newRow = {
            id: `temp_row_${Date.now()}`,
            projectId: projectId as Id<"mapping_projects">,
            values: {},
            order: bufferedCards.length,
        };
        setBufferedCards(prev => [...prev, newRow]);
        setIsDirty(true);
        toast.success("Row added locally!");
    };

    useEffect(() => {
        if (isAddingRow && !isSaving) {
            handleAddRow();
            setIsAddingRow?.(false);
        }
    }, [isAddingRow, isSaving, setIsAddingRow]);

    useEffect(() => {
        if (template.fields) {
            const defaultOrder = [...template.fields]
                .sort((a, b) => a.order - b.order)
                .map(f => f.id);

            // Try to load from localStorage first
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(`mapper_${projectId}_columnOrder`);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored) as string[];
                        // Verify all current fields are in the stored order
                        const currentFieldIds = template.fields.map(f => f.id);
                        const isValid = currentFieldIds.every(id => parsed.includes(id)) &&
                            parsed.length === currentFieldIds.length;

                        if (isValid) {
                            setColumnOrder(parsed);
                            return;
                        }
                    } catch (e) {
                        console.error("Error parsing stored column order", e);
                    }
                }
            }
            setColumnOrder(defaultOrder);
        }
    }, [template.fields, projectId]);

    const filteredAndSortedCards = useMemo(() => {
        let result = bufferedCards.filter(c => !c.isDeleted);

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((card) => {
                return Object.values(card.values || {}).some((val) =>
                    String(val).toLowerCase().includes(query)
                );
            });
        }

        // Apply sort
        if (sortConfig.fieldId) {
            result.sort((a, b) => {
                const valA = a.values?.[sortConfig.fieldId!] ?? "";
                const valB = b.values?.[sortConfig.fieldId!] ?? "";

                if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
                if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [bufferedCards, searchQuery, sortConfig]);

    const sortedFields = useMemo(() => {
        return [...bufferedFields].sort((a, b) => {
            const indexA = columnOrder.indexOf(a.id);
            const indexB = columnOrder.indexOf(b.id);

            // If not in columnOrder (e.g. newly added), fallback to default order or put at end
            if (indexA === -1 && indexB === -1) return a.order - b.order;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
        });
    }, [bufferedFields, columnOrder]);

    // Global drag listeners for rows
    useEffect(() => {
        if (!isDraggingRow) return;

        // Prevent selection and lock cursor
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ns-resize';

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - rowDragY;
            const change = Math.trunc(deltaY / 40);

            // Limit removal to current visible card count in snapshot
            const visibleSnapshot = dragRowsSnapshot.current.filter(c => !c.isDeleted);
            const constrainedChange = change < 0
                ? Math.max(change, -visibleSnapshot.length)
                : change;

            if (constrainedChange === pendingRows) return;
            setPendingRows(constrainedChange);

            // LIVE UPDATE: Apply changes to bufferedCards based on initial snapshot
            const base = [...dragRowsSnapshot.current];
            const visible = base.filter(c => !c.isDeleted);

            if (constrainedChange > 0) {
                // Add rows
                const newRows = Array.from({ length: constrainedChange }).map((_, i) => ({
                    id: `temp_row_${Date.now()}_${i}`,
                    projectId: projectId as Id<"mapping_projects">,
                    values: {},
                    order: base.length + i,
                }));
                setBufferedCards([...base, ...newRows]);
            } else if (constrainedChange < 0) {
                // Mark as deleted from the end of visible cards
                const toRemoveCount = Math.abs(constrainedChange);
                const toRemove = visible.slice(-toRemoveCount);
                const removeIds = new Set(toRemove.map(c => c._id || c.id));

                setBufferedCards(base.map(c =>
                    removeIds.has(c._id || c.id) ? { ...c, isDeleted: true } : c
                ));
            } else {
                setBufferedCards(base);
            }
            setIsDirty(true);
        };

        const handleMouseUp = () => {
            setIsDraggingRow(false);
            setPendingRows(0);
            dragRowsSnapshot.current = [];
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDraggingRow, rowDragY, pendingRows, projectId]);

    // Global drag listeners for columns
    useEffect(() => {
        if (!isDraggingCol) return;

        // Prevent selection and lock cursor
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'ew-resize';

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - colDragX;
            const change = Math.trunc(deltaX / 150);

            // Limit removal to current visible field count in snapshot
            const visibleSnapshot = dragColsSnapshot.current;
            const constrainedChange = change < 0
                ? Math.max(change, -visibleSnapshot.length)
                : change;

            if (constrainedChange === pendingCols) return;
            setPendingCols(constrainedChange);

            // LIVE UPDATE: Apply changes based on initial snapshots
            const baseFields = [...dragColsSnapshot.current];
            const baseOrder = [...dragColsOrderSnapshot.current];

            if (constrainedChange > 0) {
                // Add columns
                const newFields = Array.from({ length: constrainedChange }).map((_, i) => ({
                    id: `temp_field_${Date.now()}_${i}`,
                    name: "New Field",
                    type: "text" as FieldType,
                    required: false,
                    config: {},
                    order: baseFields.length + i,
                }));
                setBufferedFields([...baseFields, ...newFields]);
                setColumnOrder([...baseOrder, ...newFields.map(f => f.id)]);
            } else if (constrainedChange < 0) {
                // Remove columns from the end
                const toRemoveCount = Math.abs(constrainedChange);
                const toRemoveIds = baseOrder.slice(-toRemoveCount);
                const removeSet = new Set(toRemoveIds);

                setBufferedFields(baseFields.filter(f => !removeSet.has(f.id)));
                setColumnOrder(baseOrder.filter(id => !removeSet.has(id)));
            } else {
                setBufferedFields(baseFields);
                setColumnOrder(baseOrder);
            }
            setIsDirty(true);
        };

        const handleMouseUp = () => {
            setIsDraggingCol(false);
            setPendingCols(0);
            dragColsSnapshot.current = [];
            dragColsOrderSnapshot.current = [];
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDraggingCol, colDragX, pendingCols, columnOrder]);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );



    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setColumnOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Persist to localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem(`mapper_${projectId}_columnOrder`, JSON.stringify(newOrder));
                }

                setIsDirty(true);
                return newOrder;
            });
        }
    };

    const handleSort = (fieldId: string) => {
        setSortConfig((prev) => ({
            fieldId,
            direction: prev.fieldId === fieldId && prev.direction === "asc" ? "desc" : "asc",
        }));
    };

    useEffect(() => {
        if (activeCell && inputRef.current) {
            const input = inputRef.current.querySelector('input, textarea, select');
            if (input instanceof HTMLElement) {
                input.focus();
            }
        }
    }, [activeCell]);

    if (!cards) {
        return <div className="p-8 text-muted-foreground">Loading cards...</div>;
    }



    // Single cell edit handlers
    const handleCellChange = (cardIdOrTempId: string, fieldId: string, newValue: unknown) => {
        setBufferedCards(prev => prev.map(c => {
            if ((c._id || c.id) === cardIdOrTempId) {
                return {
                    ...c,
                    values: {
                        ...c.values,
                        [fieldId]: newValue
                    }
                };
            }
            return c;
        }));
        setIsDirty(true);
    };


    const handleDeleteRow = (cardIdOrTempId: string) => {
        setBufferedCards(prev => prev.map(c =>
            (c._id || c.id) === cardIdOrTempId ? { ...c, isDeleted: true } : c
        ));
        setIsDirty(true);
    };

    const handleSync = async () => {
        if (!isDirty) return;
        setIsSaving(true);
        const toastId = toast.loading("Saving changes...");

        try {
            await syncData({
                projectId: projectId as Id<"mapping_projects">,
                cards: bufferedCards.map((c, index) => ({
                    _id: c._id,
                    id: c.id,
                    values: c.values,
                    order: index,
                    isDeleted: !!c.isDeleted
                })),
                fields: bufferedFields.map((f, index) => ({
                    ...f,
                    config: f.config ?? {},
                    order: index
                }))
            });

            setIsDirty(false);
            toast.success("All changes saved!", { id: toastId });
        } catch (error) {
            console.error("Sync error:", error);
            toast.error("Failed to save changes", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };



    // Add column handlers
    const handleAddColumn = () => {
        setIsAddingColumn(true);
        setNewFieldType(null);
        setNewFieldName("");
        setNewFieldRequired(false);
    };

    const handleFieldTypeSelect = (fieldType: FieldType) => {
        setNewFieldType(fieldType);
        setIsAddingColumn(false);
    };

    const handleCancelAddColumn = () => {
        setIsAddingColumn(false);
        setNewFieldType(null);
        setNewFieldName("");
        setNewFieldRequired(false);
    };

    const handleSaveColumn = () => {
        if (!newFieldType || !newFieldName.trim()) {
            toast.error("Please enter a field name");
            return;
        }

        const newField = {
            id: `field_${Date.now()}`,
            name: newFieldName.trim(),
            type: newFieldType,
            required: newFieldRequired,
            config: {},
            order: bufferedFields.length,
        };

        setBufferedFields(prev => [...prev, newField]);
        setColumnOrder(prev => [...prev, newField.id]);
        setIsDirty(true);
        setNewFieldType(null);
        setNewFieldName("");
        setNewFieldRequired(false);
    };

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                    <Database className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No cards yet</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    Start adding cards to populate your database
                </p>
                <div className="flex gap-3">
                    <Button size="lg" onClick={handleAddRow} disabled={isSaving}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSaving ? "Adding..." : "Add Row"}
                    </Button>
                    <Link href={`/${scope}/${slug}/mapper/${projectId}/card/new`}>
                        <Button size="lg" variant="outline">
                            <Database className="w-4 h-4 mr-2" />
                            Create Card
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full p-4 relative group/table">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="relative w-fit max-w-full">
                    <div className="overflow-x-auto border bg-card relative rounded-md">
                        <Table className="table-fixed w-max border-collapse">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b">


                                    <SortableContext
                                        items={columnOrder}
                                        strategy={horizontalListSortingStrategy}
                                    >
                                        {sortedFields.map((field) => (
                                            <SortableHeader
                                                key={field.id}
                                                field={field}
                                                sortConfig={sortConfig}
                                                onSort={handleSort}
                                                width={columnWidths[field.id]}
                                                onResize={handleResize}
                                            />
                                        ))}
                                    </SortableContext>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAndSortedCards.map((card, index) => {
                                    return (
                                        <TableRow
                                            key={card._id}
                                            className="group/row relative border-b last:border-b-0 hover:bg-accent/5"
                                        >
                                            {sortedFields.map((field) => {
                                                const cellKey = `${card._id || card.id}-${field.id}`;
                                                const isActive = activeCell === cellKey;
                                                const width = columnWidths[field.id];

                                                return (
                                                    <TableCell
                                                        key={field.id}
                                                        className="p-0 border-r last:border-r-0 h-full overflow-hidden"
                                                        style={{
                                                            width: width ? `${width}px` : 'auto',
                                                            minWidth: width ? `${width}px` : '150px',
                                                            maxWidth: width ? `${width}px` : 'none',
                                                        }}
                                                    >
                                                        <div
                                                            onClick={() => setActiveCell(cellKey)}
                                                            className={cn(
                                                                "h-full min-h-[40px] transition-all",
                                                                isActive ? "bg-background ring-2 ring-inset ring-primary z-10" : "hover:bg-black/5"
                                                            )}
                                                        >
                                                            {isActive ? (
                                                                <div ref={inputRef}>
                                                                    <FieldInput
                                                                        fieldId={cellKey}
                                                                        fieldType={field.type}
                                                                        fieldName=""
                                                                        value={card.values?.[field.id]}
                                                                        onChange={(val) => handleCellChange((card._id as unknown as string) || card.id || "", field.id, val)}
                                                                        config={field.config as Record<string, unknown> | undefined}
                                                                        required={field.required}
                                                                        minimal
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="px-3 py-2 h-full flex items-center">
                                                                    <FieldDisplay
                                                                        fieldType={field.type}
                                                                        value={card.values?.[field.id]}
                                                                        config={field.config as Record<string, unknown> | undefined}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Notion-style Row Add Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (isHoveredRow || isDraggingRow) ? 1 : 0 }}
                        onHoverStart={() => setIsHoveredRow(true)}
                        onHoverEnd={() => setIsHoveredRow(false)}
                        className="relative left-0 right-0 -bottom-2 h-4 z-50 group/row-bar"
                    >
                        <div
                            ref={rowBarRef}
                            className={cn(
                                "w-full h-full bg-accent/10 hover:bg-accent/30 rounded-md border border-dashed border-accent/50 flex flex-col items-center justify-center transition-colors relative cursor-ns-resize",
                                isDraggingRow && "bg-accent/60 scale-[1.01] shadow-lg border-solid"
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                setIsDraggingRow(true);
                                setRowDragY(e.clientY);
                                setPendingRows(0);
                                dragRowsSnapshot.current = [...bufferedCards];
                                rowDragStart.current = { x: e.clientX, y: e.clientY };
                            }}
                            onClick={(e) => {
                                const dist = Math.sqrt(Math.pow(e.clientX - rowDragStart.current.x, 2) + Math.pow(e.clientY - rowDragStart.current.y, 2));
                                if (dist > 5) return;
                                if (!isDraggingRow) handleAddRow();
                            }}
                        >
                            <motion.div
                                animate={{ rotate: isDraggingRow ? 180 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <Plus className="w-2 h-2 text-muted-foreground group-hover/row-bar:text-foreground transition-colors" />
                            </motion.div>

                            <AnimatePresence>
                                {(isHoveredRow || isDraggingRow) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 24, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute z-50 bg-popover mt-8 text-popover-foreground border px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap min-w-[140px]"
                                    >
                                        {isDraggingRow ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="text-sm font-mono font-bold text-primary">
                                                    {sortedFields.length} <span className="text-muted-foreground/50">×</span> {filteredAndSortedCards.length}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                <div className="font-semibold text-xs text-foreground">Click to add a new row</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">Drag to add or remove rows</div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Notion-style Col Add Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: (isHoveredCol || isDraggingCol) ? 1 : 0 }}
                        onHoverStart={() => setIsHoveredCol(true)}
                        onHoverEnd={() => setIsHoveredCol(false)}
                        className="absolute -right-6 top-10 bottom-4 w-4 z-30 group/col-bar"
                    >
                        <div
                            ref={colBarRef}
                            className={cn(
                                "w-full h-full bg-accent/10 hover:bg-accent/30 rounded-md border border-dashed border-accent/50 flex flex-col items-center justify-center transition-colors relative cursor-ew-resize",
                                isDraggingCol && "bg-accent/60 scale-[1.01] shadow-lg border-solid"
                            )}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                document.body.style.userSelect = 'none';
                                document.body.style.cursor = 'ew-resize';
                                setIsDraggingCol(true);
                                setColDragX(e.clientX);
                                setPendingCols(0);
                                dragColsSnapshot.current = [...bufferedFields];
                                dragColsOrderSnapshot.current = [...columnOrder];
                                colDragStart.current = { x: e.clientX, y: e.clientY };
                            }}
                            onClick={(e) => {
                                const dist = Math.sqrt(Math.pow(e.clientX - colDragStart.current.x, 2) + Math.pow(e.clientY - colDragStart.current.y, 2));
                                if (dist > 5) return;
                                if (!isDraggingCol) handleAddColumn();
                            }}
                        >
                            <motion.div
                                animate={{ rotate: isDraggingCol ? 90 : 0 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            >
                                <Plus className="w-2 h-2 text-muted-foreground group-hover/col-bar:text-foreground transition-colors" />
                            </motion.div>

                            <AnimatePresence>
                                {(isHoveredCol || isDraggingCol) && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 28, scale: 1 }}
                                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                                        className="absolute z-100 -left-22 -bottom-13 bg-popover text-popover-foreground border px-3 py-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap min-w-[140px]"
                                    >
                                        {isDraggingCol ? (
                                            <div className="flex flex-col items-center gap-0.5">
                                                <div className="text-sm font-mono font-bold text-primary">
                                                    {sortedFields.length} <span className="text-muted-foreground/50">×</span> {filteredAndSortedCards.length}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 text-center">
                                                <div className="font-semibold text-xs text-foreground">Click to add a new column</div>
                                                <div className="text-[10px] text-muted-foreground font-medium">Drag to add or remove columns</div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </DndContext >

            {/* Field Type Selector Dialog */}
            {
                isAddingColumn && (
                    <FieldTypeSelector
                        onSelect={handleFieldTypeSelect}
                        onClose={() => setIsAddingColumn(false)}
                    />
                )
            }

            {/* Field Configuration Dialog */}
            {
                newFieldType && !isDraggingCol && !isAddingColumn && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 text-foreground">
                        <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-semibold mb-4">Configure Field</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="fieldName">Field Name</Label>
                                    <Input
                                        id="fieldName"
                                        value={newFieldName}
                                        onChange={(e) => setNewFieldName(e.target.value)}
                                        placeholder="Enter field name..."
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleSaveColumn();
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="fieldRequired"
                                        checked={newFieldRequired}
                                        onChange={(e) => setNewFieldRequired(e.target.checked)}
                                        className="rounded"
                                    />
                                    <Label htmlFor="fieldRequired" className="cursor-pointer">
                                        Required field
                                    </Label>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelAddColumn}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveColumn}
                                    disabled={isSaving || !newFieldName.trim()}
                                >
                                    {isSaving ? "Adding..." : "Add Field"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Save Button */}
            <AnimatePresence>
                {isDirty && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 right-8 z-50"
                    >
                        <Button
                            size="lg"
                            className="shadow-2xl h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-full"
                            onClick={handleSync}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            <span className="font-semibold">Save Changes</span>
                            {isDirty && (
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
