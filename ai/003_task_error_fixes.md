./convex/uploads.ts:18:14
Type error: 'prepareUpload' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

  16 |  * This is called BEFORE the browser uploads to GitHub
  17 |  */
> 18 | export const prepareUpload = action({
     |              ^
  19 |     args: {
  20 |         repoId: v.id("repos"),
  21 |         fileName: v.string(),
Next.js build worker exited with code: 1 and signal: null
 ELIFECYCLE  Command failed with exit code 1.