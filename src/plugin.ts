import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { TriggerMacro } from "./km/macro";

streamDeck.logger.setLevel(LogLevel.TRACE); // min threshold to capture
// streamDeck.logger.setLevel(LogLevel.DEBUG); // defaults otherwise: DEBUG in dev, INFO in prod

streamDeck.actions.registerAction(new TriggerMacro());
streamDeck.connect();

// import { startExternalServer as startExternalWebSocketServer } from './webby';
// startExternalWebSocketServer();

import * as chokeadick from "./fs/chokeadick"
chokeadick.chokit();

