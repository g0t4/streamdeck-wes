import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { TriggerMacro } from "./actions/trigger-macro";

streamDeck.logger.setLevel(LogLevel.TRACE);
streamDeck.actions.registerAction(new TriggerMacro());
streamDeck.connect();

import { startExternalServer as startExternalWebSocketServer } from './webby';
startExternalWebSocketServer();
