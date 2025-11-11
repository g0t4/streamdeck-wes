import {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    Action,
    JsonValue,
    SendToPluginEvent,
    TitleParametersDidChangeEvent,
    Target,
    streamDeck,
} from "@elgato/streamdeck";
import { KeyboardMaestroHelper } from './client';
import { config } from "./titles";

type TriggerMacroSettings = {
    macro_uuid?: string;
    parameter?: string;
    dynamic_title?: string;
};

@action({ UUID: "com.wes.streamdeck.km.macro" })
export class TriggerMacro extends SingletonAction<TriggerMacroSettings> {

    override async onWillAppear(ev: WillAppearEvent<TriggerMacroSettings>): Promise<void> {
        const title_path = ev.payload.settings.dynamic_title;
        if (!title_path) {
            return;
        }
        const fn = Function("config", `with(config){ return ${title_path}; }`);
        const resolved = fn(config);
        ev.action.setTitle(resolved ?? '');
        return;
    }

    override async onKeyDown(ev: KeyDownEvent<TriggerMacroSettings>): Promise<void> {
        const { settings } = ev.payload;
        // FYI can store state, IIAC across restarts too? 
        // settings.count = (settings.count ?? 0) + settings.increment

        if (!settings.macro_uuid) {
            streamDeck.logger.error("No macro UUID set, aborting.");
            return;
        }

        await KeyboardMaestroHelper.executeMacro(settings.macro_uuid, settings.parameter);
    }

    async sendMacrosList(ev: SendToPluginEvent<MySendToPlugin, TriggerMacroSettings>) {
        const macroGroups = await KeyboardMaestroHelper.getMacroList();

        // docs on format of options: https://sdpi-components.dev/docs/components/select
        const macrosList = macroGroups.map(g => {
            return {
                label: g.name,
                children: g.macros.map(m => ({
                    label: m.name,
                    value: m.uid
                }))
            };
        });

        // FYI streamDeck.ui.sendToPropertyInspector in v2.0.0 (ui.current is removed in 2, or deprecated)
        streamDeck.ui.current?.sendToPropertyInspector({
            event: ev.payload.event,
            items: macrosList
        })
    }

    override async onSendToPlugin(ev: SendToPluginEvent<MySendToPlugin, TriggerMacroSettings>): Promise<void> {
        if (ev.payload?.event === 'list-macros') {
            this.sendMacrosList(ev);
        }
    }
}

type MySendToPlugin = {
    event: string;
}
