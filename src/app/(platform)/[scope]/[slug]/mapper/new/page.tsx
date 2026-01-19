import { CreateProjectForm } from "@/components/apps/mapper/create-project-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewMapperProjectPage({
    params,
}: {
    params: Promise<{ scope: string; slug: string }>;
}) {
    const { scope, slug } = await params;

    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            <Link href={`/${scope}/${slug}/mapper`}>
                <Button variant="ghost" className="mb-6">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
                <p className="text-muted-foreground">
                    Set up a new custom database to organize your data
                </p>
            </div>

            <CreateProjectForm scope={scope} slug={slug} />
        </div>
    );
}
