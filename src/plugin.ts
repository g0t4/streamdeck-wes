import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { TriggerMacro } from "./actions/increment-counter";

streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new TriggerMacro());

streamDeck.connect();
