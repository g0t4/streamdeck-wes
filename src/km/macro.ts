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
import { KeyboardMaestroHelper } from './km';

type TriggerMacroSettings = {
    macro_uuid?: string;
    trigger_value?: string;
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

        await KeyboardMaestroHelper.executeMacro(settings.macro_uuid, settings.trigger_value);
    }

    override async onSendToPlugin(ev: SendToPluginEvent<MySendToPlugin, TriggerMacroSettings>): Promise<void> {
        if (ev.payload?.event === 'list-macros') {
            const macroGroups = await KeyboardMaestroHelper.getMacroList();

            // const colors = [{
            //     label: '__MSG_primary__',
            //     children: [{
            //         label: '__MSG_red__',
            //         value: '#ff0000'
            //     }, {
            //         label: '__MSG_green__',
            //         value: '#00ff00'
            //     }, {
            //         label: '__MSG_blue__',
            //         value: '#0000ff'
            //     }]
            // }, {
            //     label: '__MSG_black__',
            //     value: '#000000'
            // }, {
            //     label: '__MSG_white__',
            //     value: '#ffffff'
            // }];

            const options = macroGroups.map(g => {
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
                items: options
            })
        }
    }
}

type MySendToPlugin = {
    event: string;
}
