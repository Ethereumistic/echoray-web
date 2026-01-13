/**
 * Supabase utilities barrel export.
 * 
 * Usage:
 * - For client components: import { createClient } from '@/lib/supabase/client'
 * - For server components: import { createClient } from '@/lib/supabase/server'
 * - For middleware: import { updateSession } from '@/lib/supabase/middleware'
 */

export { createClient as createBrowserClient } from './client'
export { createClient as createServerClient } from './server'
export { updateSession } from './middleware'
