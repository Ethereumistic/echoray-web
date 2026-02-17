import { CardForm } from "@/components/apps/mapper/card-form";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@echoray/ui/components/ui/button";

export default async function NewCardPage({
    params,
}: {
    params: Promise<{ scope: string; slug: string; mapperId: string }>;
}) {
    const { scope, slug, mapperId } = await params;

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl">
            <Link href={`/${scope}/${slug}/mapper/${mapperId}`}>
                <Button variant="ghost" className="mb-6">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Button>
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Card</h1>
                <p className="text-muted-foreground">
                    Fill in the fields to create a new record
                </p>
            </div>

            <CardForm
                projectId={mapperId}
                scope={scope}
                slug={slug}
            />
        </div>
    );
}
