import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";

streamDeck.logger.setLevel(LogLevel.TRACE);

streamDeck.actions.registerAction(new IncrementCounter());

streamDeck.connect();
