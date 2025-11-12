import { Action } from "@elgato/streamdeck";
import { streamDeck } from "@elgato/streamdeck";
const logger = streamDeck.logger.createScope("titles");

export const config = {};

export function update_title(action: Action, settings: "TriggerMacroSettings") {
    // FYI can have titles with:
    //   ask.fim.model + " foo the bar";
    const title_path = settings.dynamic_title;
    if (!title_path) {
        return;
    }
    // FYI I can optimize this in the future when I have tons of buttons subscribed to updates
    //  for example, cache the fn until dynamic_title changes (i.e. global cache)
    //  scope to what changed (i.e. only things with "\bask\." ) 
    const fn = Function("config", `with(config){ return ${title_path}; }`);
    try {
        const resolved = fn(config);
        if (resolved === "qwen25coder") {
            logger.info("SET IMAGE");
            // FYI if title OR image are set in button designer, then setTitle/setImage doesn't show the title/image!
            action.setImage("./icons/qwen.svg");
            action.setTitle("");
            // read image base64 into buffer
            // icons/qwen.svg
            // action.setImage("icons/out.png");
        } else {
            action.setTitle(resolved ?? '');
            // Generate a simple black SVG and set it as the button image
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="black"/></svg>`;
            const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
            action.setImage(dataUrl);
        }
    } catch (error) {
        logger.error(`💩 Holy crap, something went wrong: ${error}`);
        throw error;
    }
}
