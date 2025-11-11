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

@action({ UUID: "com.wes.kmtrigger.macro" })
export class TriggerMacro extends SingletonAction<CounterSettings> {
    // override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
    //     return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
    // }

    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        console.log("triggering macro...", ev);
        const { settings } = ev.payload;
        // settings.count = (settings.count ?? 0) + settings.increment

        const uuid = settings.macro_uuid;
        console.log('Macro UUID:', uuid);
        await KeyboardMaestroHelper.executeMacro(uuid);
    }

    override async onSendToPlugin(ev: SendToPluginEvent<MySendToPlugin, CounterSettings>): Promise<void> | void {
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

/**
 * Settings for {@link TriggerMacro}.
 */
type CounterSettings = {
    count?: number;
    macro_uuid?: string;
};
