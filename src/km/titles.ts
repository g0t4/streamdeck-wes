import { Action } from "@elgato/streamdeck";

export const config = {};

export function update_title(action: Action, settings: "TriggerMacroSettings") {
    // FYI can have titles with:
    //   ask.fim.model + " foo the bar";
    const title_path = settings.dynamic_title;
    if (!title_path) {
        return;
    }
    const fn = Function("config", `with(config){ return ${title_path}; }`);
    const resolved = fn(config);
    action.setTitle(resolved ?? '');
}

