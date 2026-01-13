import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Folder, MoreHorizontal } from 'lucide-react'

/**
 * Dashboard projects page.
 * Lists all projects for the current user.
 */
export default function ProjectsPage() {
    // Mock projects data - in a real app, fetch from your database
    const projects = [
        { id: 1, name: 'Website Redesign', status: 'In Progress', lastUpdated: '2 hours ago' },
        { id: 2, name: 'Mobile App', status: 'Planning', lastUpdated: '1 day ago' },
        { id: 3, name: 'API Integration', status: 'Completed', lastUpdated: '3 days ago' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress':
                return 'bg-blue-500/10 text-blue-500'
            case 'Planning':
                return 'bg-yellow-500/10 text-yellow-500'
            case 'Completed':
                return 'bg-green-500/10 text-green-500'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Projects"
                description="Manage and track your projects"
            />

            <main className="flex-1 p-6 space-y-6">
                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {projects.length} projects total
                        </p>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card key={project.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Folder className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base">{project.name}</CardTitle>
                                        <CardDescription>{project.lastUpdated}</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </CardContent>
                        </Card>
                    ))}

                    {/* New Project Card */}
                    <Card className="border-dashed hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[140px]">
                        <div className="text-center text-muted-foreground">
                            <Plus className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">Create New Project</p>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    )
}
