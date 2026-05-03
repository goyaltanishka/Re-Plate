import React, { useEffect, useRef, useState } from 'react';

const BrowserPodDemo: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Initializing BrowserPod...');
  const [error, setError] = useState<string | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  useEffect(() => {
    const initPod = async () => {
      try {
        if (typeof window.SharedArrayBuffer === 'undefined') {
          throw new Error('Browser does not support required security features for BrowserPod.');
        }

        const browserpodKey = import.meta.env.VITE_BROWSERPOD_API_KEY;
        if (!browserpodKey) throw new Error('VITE_BROWSERPOD_API_KEY is not set.');

        setStatus('Booting BrowserPod...');
        const { BrowserPod } = await import('@leaningtech/browserpod');

        const pod = await BrowserPod.boot({
          apiKey: browserpodKey,
        } as any);

        if (!terminalRef.current) throw new Error('Terminal container not available.');

        setStatus('Creating terminal...');
        const terminal = await pod.createDefaultTerminal(terminalRef.current);

        pod.onPortal((portal: any) => {
        const port = Number(portal?.port);
        if (!Number.isInteger(port) || port <= 0) return;
        setStatus('Re:Plate node is active!');
        setPortalUrl('ready');
        });

        setStatus('Setting up project files...');
        const projectPath = '/home/user/project';
        await pod.createDirectory(projectPath);

        // Copy package.json
        const pkgResp = await fetch('/project/package.json');
        if (!pkgResp.ok) throw new Error('Could not fetch project/package.json');
        const pkgFile = await pod.createFile(`${projectPath}/package.json`, 'binary');
        await pkgFile.write(await pkgResp.arrayBuffer() as any);
        await pkgFile.close();

        // Copy main.js
        const mainResp = await fetch('/project/main.js');
        if (!mainResp.ok) throw new Error('Could not fetch project/main.js');
        const mainFile = await pod.createFile(`${projectPath}/main.js`, 'binary');
        await mainFile.write(await mainResp.arrayBuffer() as any);
        await mainFile.close();

        setStatus('Installing dependencies...');
        await pod.run('npm', ['install'], {
          echo: true,
          terminal,
          cwd: projectPath
        });

        setStatus('Starting Re:Plate...');
        await pod.run('node', ['main.js'], {
          echo: true,
          terminal,
          cwd: projectPath
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        setStatus('BrowserPod initialization failed.');
        console.error(err);
      }
    };

    initPod();
  }, []);

  return (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0d0e', color: 'white', fontFamily: 'monospace' }}>
    <p style={{ color: '#3fb950', fontSize: 16, marginBottom: 8 }}>{status}</p>
    {error && <p style={{ color: '#f85149', fontSize: 13 }}>Error: {error}</p>}
    {portalUrl === 'ready' && (
      <a href="https://replate-peach.vercel.app?pod=true" style={{ marginTop: 24, padding: '12px 32px', background: '#3fb950', color: '#000', borderRadius: 8, fontWeight: 'bold', textDecoration: 'none', fontSize: 16 }}>
        Enter Re:Plate →
      </a>
    )}
    <div ref={terminalRef} style={{ width: '80%', maxWidth: 800, height: 300, marginTop: 32, background: '#000', borderRadius: 8, padding: 8, overflow: 'auto' }} />
  </div>
);
};

export default BrowserPodDemo;