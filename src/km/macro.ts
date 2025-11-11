import {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    Logger,
    Action,
    JsonValue,
    SendToPluginEvent,
    TitleParametersDidChangeEvent,
    Target,
    streamDeck,
} from "@elgato/streamdeck";
import { KeyboardMaestroHelper } from './client';

type TriggerMacroSettings = {
    macro_uuid?: string;
    parameter?: string;
};

@action({ UUID: "com.wes.streamdeck.km.macro" })
export class TriggerMacro extends SingletonAction<TriggerMacroSettings> {
    // override async onWillAppear(ev: WillAppearEvent<TrigerMacroSettings>>): Promise<void> {
    //     return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
    // }

    override async onKeyDown(ev: KeyDownEvent<TriggerMacroSettings>): Promise<void> {
        console.log("triggering macro...", ev);
        const { settings } = ev.payload;
        // FYI can store state, IIAC across restarts too? 
        // settings.count = (settings.count ?? 0) + settings.increment

        if (!settings.macro_uuid) {
            console.log("No macro UUID set, aborting.");
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
