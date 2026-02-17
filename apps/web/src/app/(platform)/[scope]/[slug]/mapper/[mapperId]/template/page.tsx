import { TemplateBuilder } from "@/components/apps/mapper/template-builder";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@echoray/ui/components/ui/button";
import { Suspense } from "react";

export default async function TemplateBuilderPage({
    params,
}: {
    params: Promise<{ scope: string; slug: string; mapperId: string }>;
}) {
    const { scope, slug, mapperId } = await params;

    return (
        <div className="container mx-auto py-8 px-4">
            <Link href={`/${scope}/${slug}/mapper/${mapperId}`}>
                <Button variant="ghost" className="mb-6">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Button>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Template Builder</h1>
                <p className="text-muted-foreground">
                    Design your card structure by adding and configuring fields
                </p>
            </div>

            <Suspense fallback={<div>Loading template...</div>}>
                <TemplateBuilder
                    projectId={mapperId}
                    scope={scope}
                    slug={slug}
                />
            </Suspense>
        </div>
    );
}
