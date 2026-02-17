Build Error


Error evaluating Node.js code

./apps/web/src/app/styles.css

Error evaluating Node.js code
CssSyntaxError: tailwindcss: C:\Users\badja\Documents\Projects_Developement\echoray-mono\apps\web\src\app\styles.css:1:1: "./src/styles/globals.css" is not exported under the condition "style" from package C:\Users\badja\Documents\Projects_Developement\echoray-mono\apps\web\node_modules\@echoray\ui (see exports field in C:\Users\badja\Documents\Projects_Developement\echoray-mono\apps\web\node_modules\@echoray\ui\package.json)
    [at Input.error (turbopack:///[project]/node_modules/.pnpm/postcss@8.4.31/node_modules/postcss/lib/input.js:106:16)]
    [at Root.error (turbopack:///[project]/node_modules/.pnpm/postcss@8.4.31/node_modules/postcss/lib/node.js:115:32)]
    [at Object.Once (C:\Users\badja\Documents\Projects_Developement\echoray-mono\node_modules\.pnpm\@tailwindcss+postcss@4.1.18\node_modules\@tailwindcss\postcss\dist\index.js:10:6911)]
    [at process.processTicksAndRejections (node:internal/process/task_queues:105:5)]
    [at async LazyResult.runAsync (turbopack:///[project]/node_modules/.pnpm/postcss@8.4.31/node_modules/postcss/lib/lazy-result.js:261:11)]
    [at async transform (turbopack:///[turbopack-node]/transforms/postcss.ts:70:34)]
    [at async run (turbopack:///[turbopack-node]/ipc/evaluate.ts:92:23)]

Import trace:
  Client Component Browser:
    ./apps/web/src/app/styles.css [Client Component Browser]
    ./apps/web/src/app/layout.tsx [Server Component]