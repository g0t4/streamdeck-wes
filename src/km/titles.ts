import { KeyAction } from "@elgato/streamdeck";
import { streamDeck } from "@elgato/streamdeck";
const logger = streamDeck.logger.createScope("titles");
import { TriggerMacroSettings } from "./macro";

export const config = {
    ask: {
        fim: {
            model: "",
        },
        log_threshold_text: "",
        reasoning_level: "",
    }
};

const black_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="black"/></svg>`;
const black_dataUrl = `data:image/svg+xml;base64,${Buffer.from(black_svg).toString('base64')}`;

export function update_dynamic_button(action: KeyAction<TriggerMacroSettings>, settings: TriggerMacroSettings) {
        const type = settings.dynamic_type;
        if (!type) {
            return;
        }

        try {
            if (type == "fim_model_toggle") {
                const model = config?.ask?.fim?.model;
                if (model === "qwen25coder") {
                    action.setImage("./icons/qwen.svg");
                    action.setTitle("");
                }
                else if (model === "gptoss") {
                    action.setTitle("");
                    action.setImage("./icons/openai-light.svg");
                }
            }
            else if (type == "reasoning_level") {
                const level = config?.ask?.reasoning_level;
                action.setTitle(level);
                action.setImage(black_dataUrl);
            }
            else if (type == "log_threshold") {
                const threshold = config?.ask?.log_threshold_text;
                action.setTitle(threshold);
                action.setImage(black_dataUrl);
            }
            else {
                action.setTitle('TODO dynamic type: ' + type);
                action.setImage(black_dataUrl);
            }
        } catch (error) {
            logger.error(`💩 Holy crap, something went wrong: ${error}`);
            throw error;
        }
}
