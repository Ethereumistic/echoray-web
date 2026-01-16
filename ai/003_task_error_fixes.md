./src/components/dashboard/roles-list.tsx:77:34
Type error: Type '"roles.manage"' is not assignable to type '"profile.view" | "profile.edit" | "org.create" | "p.project.create" | "o.project.view" | "o.project.create" | "o.project.edit" | "o.project.delete" | "o.member.view" | "o.member.invite" | ... 11 more ... | ("profile.view" | ... 19 more ... | "system.support")[]'. Did you mean '"o.role.manage"'?

  75 |                     </p>
  76 |                 </div>
> 77 |                 <PermissionGuard permission="roles.manage">
     |                                  ^
  78 |                     <Button size="sm">
  79 |                         <Plus className="mr-2 h-4 w-4" />
  80 |                         Create Role
Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.