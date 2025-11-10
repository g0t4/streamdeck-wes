#!/usr/bin/env node

import WebSocket from 'ws';
import { KeyboardMaestroHelper } from './km-helper';

interface StreamDeckEvent {
  event: string;
  action?: string;
  context?: string;
  device?: string;
  payload?: any;
}

class KeyboardMaestroPlugin {
  private ws: WebSocket | null = null;
  private port: number = 0;
  private pluginUUID: string = '';
  private registerEvent: string = '';

  constructor() {
    this.init();
  }

  private init() {
    // Stream Deck passes connection info via command line args
    const args = process.argv.slice(2);

    if (args.length >= 4) {
      this.port = parseInt(args[0]);
      this.pluginUUID = args[1];
      this.registerEvent = args[2];
      // args[3] is info JSON
      // args[4] is additional info
    }

    this.connect();
  }

  private connect() {
    const ws = new WebSocket(`ws://localhost:${this.port}`);
    this.ws = ws;

    ws.on('open', () => {
      console.log('Connected to Stream Deck');
      this.register();
    });

    ws.on('message', (data: WebSocket.Data) => {
      const event: StreamDeckEvent = JSON.parse(data.toString());
      this.handleEvent(event);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      console.log('Disconnected from Stream Deck');
    });
  }

  private register() {
    if (this.ws) {
      const json = {
        event: this.registerEvent,
        uuid: this.pluginUUID
      };
      this.ws.send(JSON.stringify(json));
    }
  }

  private async handleEvent(event: StreamDeckEvent) {
    console.log('Event:', event.event);

    switch (event.event) {
      case 'keyDown':
        await this.handleKeyDown(event);
        break;
      case 'willAppear':
        await this.handleWillAppear(event);
        break;
      case 'sendToPlugin':
        await this.handleSendToPlugin(event);
        break;
    }
  }

  private async handleKeyDown(event: StreamDeckEvent) {
    const settings = event.payload?.settings;

    if (settings?.uid) {
      console.log(`Executing macro: ${settings.label || settings.uid}`);
      await this.executeMacro(settings.uid, settings.param);
    } else {
      console.log('No macro configured for this button');
      this.showAlert(event.context!);
    }
  }

  private async handleWillAppear(event: StreamDeckEvent) {
    // Optionally refresh macro list when button appears
    console.log('Button appeared:', event.context);
  }

  private async handleSendToPlugin(event: StreamDeckEvent) {
    const payload = event.payload;

    if (payload?.msg === 'refreshmacrolist') {
      console.log('Refreshing macro list...');
      const groups = await this.getMacroList();
      this.sendToPropertyInspector(event.context!, { groups });
    }
  }

  private async executeMacro(uid: string, param?: string) {
    try {
      await KeyboardMaestroHelper.executeMacro(uid, param);
      console.log('Macro executed successfully');
    } catch (error) {
      console.error('Failed to execute macro:', error);
    }
  }

  private async getMacroList() {
    try {
      const groups = await KeyboardMaestroHelper.getMacroList();
      return groups;
    } catch (error) {
      console.error('Failed to get macro list:', error);
      return [];
    }
  }

  private sendToPropertyInspector(context: string, payload: any) {
    if (this.ws) {
      const json = {
        event: 'sendToPropertyInspector',
        context: context,
        payload: payload
      };
      this.ws.send(JSON.stringify(json));
    }
  }

  private showAlert(context: string) {
    if (this.ws) {
      const json = {
        event: 'showAlert',
        context: context
      };
      this.ws.send(JSON.stringify(json));
    }
  }
}

// Start the plugin
new KeyboardMaestroPlugin();
