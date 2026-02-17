import { ProjectView } from "@/components/apps/mapper/project-view";
import { Suspense } from "react";

export default async function MapperProjectPage({
    params,
}: {
    params: Promise<{ scope: string; slug: string; mapperId: string }>;
}) {
    const { scope, slug, mapperId } = await params;

    return (
        <Suspense fallback={<div className="p-8 text-muted-foreground">Loading project...</div>}>
            <ProjectView
                projectId={mapperId}
                scope={scope}
                slug={slug}
            />
        </Suspense>
    );
}
