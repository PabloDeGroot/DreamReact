import { ElectronHandler } from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    electron: ElectronHandler;
    myCustomGetDisplayMedia: () => Promise<Electron.DesktopCapturerSource>;
  }
}

export {};
