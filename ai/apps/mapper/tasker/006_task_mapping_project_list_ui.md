# Task 006: Project List UI

**Status:** Not Started  
**Priority:** High  
**Estimated Time:** 4 hours  
**Dependencies:** Task 003  

## Objective

Create the main project list page that displays all mapping projects with create, archive, and delete functionality.

## Deliverables

- [ ] Create project list page route
- [ ] Create project card component
- [ ] Implement create project flow
- [ ] Add archive/delete actions
- [ ] Add empty state

## Files to Create

### 1. Route: `src/app/(platform)/[scope]/[slug]/mapper/page.tsx`

Main mapper projects list page.

```typescript
import { Suspense } from "react";
import { MapperProjectList } from "@/components/apps/mapper/project-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function MapperPage({
  params,
}: {
  params: { scope: string; slug: string };
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mapper Projects</h1>
          <p className="text-muted-foreground mt-2">
            Create custom databases for any use case
          </p>
        </div>
        <Link href={`/${params.scope}/${params.slug}/mapper/new`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading projects...</div>}>
        <MapperProjectList scope={params.scope} slug={params.slug} />
      </Suspense>
    </div>
  );
}
```

### 2. Component: `src/components/apps/mapper/project-list.tsx`

List of all mapper projects.

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapperProjectCard } from "./project-card";
import { Database } from "lucide-react";

interface MapperProjectListProps {
  scope: string;
  slug: string;
}

export function MapperProjectList({ scope, slug }: MapperProjectListProps) {
  const projects = useQuery(api.mapping.projects.list, {
    scope,
    slug,
    includeArchived: false,
  });

  if (!projects) {
    return <div>Loading...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Database className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No mapper projects yet</h3>
        <p className="text-muted-foreground max-w-md">
          Create your first custom database to start organizing your data.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <MapperProjectCard
          key={project._id}
          project={project}
          scope={scope}
          slug={slug}
        />
      ))}
    </div>
  );
}
```

### 3. Component: `src/components/apps/mapper/project-card.tsx`

Individual project card with actions.

```typescript
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Archive, 
  Trash2, 
  Database,
  FileText 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Project {
  _id: Id<"mapping_projects">;
  name: string;
  description?: string;
  icon?: string;
  cardCount: number;
  updatedAt: number;
}

interface MapperProjectCardProps {
  project: Project;
  scope: string;
  slug: string;
}

export function MapperProjectCard({ project, scope, slug }: MapperProjectCardProps) {
  const router = useRouter();
  const archiveProject = useMutation(api.mapping.projects.archive);
  const deleteProject = useMutation(api.mapping.projects.deleteProject);

  const handleArchive = async () => {
    try {
      await archiveProject({ projectId: project._id });
      toast.success("Project archived");
    } catch (error) {
      toast.error("Failed to archive project");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteProject({ projectId: project._id });
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {project.icon ? (
                <span className="text-2xl">{project.icon}</span>
              ) : (
                <Database className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {project.cardCount} {project.cardCount === 1 ? "card" : "cards"}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}
        <Link href={`/${scope}/${slug}/mapper/${project._id}`}>
          <Button variant="outline" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Open Project
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
```

## Implementation Steps

1. Create mapper page route
2. Create project list component
3. Create project card component
4. Add create project button
5. Test all functionality

## Testing

- [ ] Projects load correctly
- [ ] Empty state displays
- [ ] Create project button works
- [ ] Archive project works
- [ ] Delete project works
- [ ] Project card links work

## Notes

- Use grid layout for responsive design
- Add loading states
- Include confirmation dialogs for destructive actions
