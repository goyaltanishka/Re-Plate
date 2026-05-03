import { BrowserPod, Terminal, Process } from 'browserpod';

interface BootOptions {
  apiKey: string;
  nodeVersion?: string;
}

export async function bootBrowserPod(apiKey: string): Promise<BrowserPod> {
  if (!apiKey) {
    throw new Error('VITE_BROWSERPOD_API_KEY environment variable is not set.');
  }

  // BrowserPod runs in the browser using a remote runtime bundle.
  // Booting a pod consumes BrowserPod account tokens.
  return await BrowserPod.boot({ apiKey, nodeVersion: '22' });
}

export async function createBrowserPodTerminal(pod: BrowserPod, container: HTMLElement): Promise<Terminal> {
  return await pod.createDefaultTerminal(container);
}

export async function runBrowserPodCommand(
  pod: BrowserPod,
  terminal: Terminal,
  command: string,
  cwd?: string
): Promise<Process> {
  const [executable, ...args] = command.split(' ');
  return await pod.run(executable, args, {
    terminal,
    cwd,
    echo: true,
  });
}

export async function onBrowserPodPortal(pod: BrowserPod, callback: (args: { url: string; port: number }) => void): Promise<void> {
  pod.onPortal(callback);
}
