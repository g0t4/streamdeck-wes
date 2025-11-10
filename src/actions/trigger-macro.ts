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
} from "@elgato/streamdeck";

@action({ UUID: "com.wes.kmtrigger.macro" })
export class TriggerMacro extends SingletonAction<CounterSettings> {
    override onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
        return ev.action.setTitle(`${ev.payload.settings.count ?? 0}`);
    }

    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        console.log("triggering macro...");
        // Update the count from the settings.
        const { settings } = ev.payload;
        settings.fuckBy ??= 1;
        settings.count = (settings.count ?? 0) + settings.fuckBy;

        // this.actions.forEach((a: Action) => {
        //     console.log("action", a);
        // })
        console.log("action", action);

        const count = ev.payload.settings.count ?? 0;
        const isRed = count % 2 === 0;
        const svg = `<svg width="100" height="100">
                                        <circle fill="${isRed ? "red" : "blue"}" r="45" cx="50" cy="50" ></circle>
                                </svg>`;
        // can set image path too
        // await ev.action.setImage(`data:image/svg+xml,${encodeURIComponent(svg)}`, {
        //     // target: Target.Software
        //     // target: Target.Hardware
        //     // target: Target.HardwareAndSoftware
        // });

        ev.action.setSettings({ count: count + 1 });

        // await ev.action.showAlert();
        // await ev.action.showOk();

        // Update the current count in the action's settings, and change the title.
        await ev.action.setSettings(settings);
        await ev.action.setTitle(`${settings.count}`);
    }

    override onSendToPlugin(ev: SendToPluginEvent<JsonValue, CounterSettings>): Promise<void> | void {
        // message from property inspector (client)
    }

    // override onTitleParametersDidChange(ev: TitleParametersDidChangeEvent<CounterSettings>): Promise<void> | void {
    //     console.log("Title parameters changed:", ev);
    // }
}

/**
 * Settings for {@link TriggerMacro}.
 */
type CounterSettings = {
    count?: number;
    fuckBy?: number;
};
