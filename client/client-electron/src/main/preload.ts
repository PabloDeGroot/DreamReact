// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent  } from 'electron';
const { join } = require("path");
const { readFileSync } = require("fs");
export type Channels = 'SET_SOURCE';

const electronHandler = {
  screen: {

    //ipcMain.on('clickMouse', async (event, arg) => {
    clickMouse(x: number, y: number, type: string) {
      ipcRenderer.send('clickMouse', {x: x, y: y, type: type});     
    },
    //ipcMain.on('keyDown', async (event, arg) => {
    keyDown(key: string) {
      ipcRenderer.send('keyDown', {key: key});     
    },
    //ipcMain.on('keyUp', async (event, arg) => {
    keyUp(key: string) {
      ipcRenderer.send('keyUp', {key: key});     
    },
    scroll(scroll: number, x: number, y: number) {
      ipcRenderer.send('scroll', {scroll: scroll, x: x, y: y});     
    }
    
  },
    
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
