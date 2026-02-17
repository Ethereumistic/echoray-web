./src/components/debug/permission-debugger.tsx:33:41
Type error: Property 'getAllTiers' does not exist on type '{ changeTier: FunctionReference<"mutation", "public", { userId?: Id<"users"> | undefined; tierSlug: string; }, { success: boolean; userId: Id<"users">; tier: { name: string; slug: string; }; }, string | undefined>; getPermissionBreakdown: FunctionReference<...>; }'.

  31 |             : "skip"
  32 |     )
> 33 |     const allTiers = useQuery(api.debug.getAllTiers, isAuthenticated && isOpen ? {} : "skip")
     |                                         ^
  34 |     const changeTier = useMutation(api.debug.changeTier)
  35 |
  36 |     // Show for all authenticated users (staff or dev mode for distinguishing UI)
Next.js build worker exited with code: 1 and signal: null
C:\Users\badja\Documents\Projects_Developement\echoray-mono\apps\web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @echoray/web@0.1.0 build: `next build`
Exit status 1