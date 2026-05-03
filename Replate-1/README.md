<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1LTRcXuwc8-gf8rTRaBNDdMwmKrH3wPjI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `VITE_GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. If you want to enable BrowserPod sandbox integration, also set `VITE_BROWSERPOD_API_KEY` in [.env.local](.env.local).
4. Run the app:
   `npm run dev`

## BrowserPod Integration

This app includes a BrowserPod helper service at `services/browserpodService.ts`.

- `bootBrowserPod(apiKey)` boots a browser-side Node.js pod using `browserpod`.
- `createBrowserPodTerminal(pod, container)` attaches a terminal to a DOM element.
- `runBrowserPodCommand(pod, terminal, command, cwd)` runs a command inside the pod.
- `onBrowserPodPortal(pod, callback)` receives portal URLs created by the pod.

The BrowserPod package loads the runtime from `https://rt.browserpod.io/2.3.4/browserpod.js` in the browser, so it must be used from client-side React code.

### Example React usage

```tsx
import { useEffect, useRef } from 'react';
import { bootBrowserPod, createBrowserPodTerminal, runBrowserPodCommand } from './services/browserpodService';

const BrowserPodDemo = () => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initPod = async () => {
      const apiKey = import.meta.env.VITE_BROWSERPOD_API_KEY;
      const pod = await bootBrowserPod(apiKey);
      if (terminalRef.current) {
        const terminal = await createBrowserPodTerminal(pod, terminalRef.current);
        await runBrowserPodCommand(pod, terminal, 'node --version');
      }
    };

    initPod().catch(console.error);
  }, []);

  return <div ref={terminalRef} className="h-80 w-full bg-slate-950 text-slate-200" />;
};
```
