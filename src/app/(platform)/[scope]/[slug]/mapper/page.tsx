import { Suspense } from "react";
import { MapperProjectList } from "@/components/apps/mapper/project-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function MapperPage({
    params,
}: {
    params: Promise<{ scope: string; slug: string }>;
}) {
    const { scope, slug } = await params;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Mapper Projects</h1>
                    <p className="text-muted-foreground mt-2">
                        Create custom databases for any use case
                    </p>
                </div>
                <Link href={`/${scope}/${slug}/mapper/new`}>
                    <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div className="text-muted-foreground">Loading projects...</div>}>
                <MapperProjectList scope={scope} slug={slug} />
            </Suspense>
        </div>
    );
}
