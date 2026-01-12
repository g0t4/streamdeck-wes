import { KeyAction } from "@elgato/streamdeck";
import { streamDeck } from "@elgato/streamdeck";
const logger = streamDeck.logger.createScope("titles");
import { TriggerMacroSettings } from "./macro";
import * as hyperactiv from "hyperactiv";

export const config = hyperactiv.default.observe({
    ask: {
        fim: {
            model: "",
        },
        log_threshold_text: "",
        gptoss: {
            fim_reasoning_level: "",
            rewrite_reasoning_level: "",
        }
    }
});

const black_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="100%" height="100%" fill="black"/></svg>`;
const black_dataUrl = `data:image/svg+xml;base64,${Buffer.from(black_svg).toString('base64')}`;

export function update_dynamic_button(action: KeyAction<TriggerMacroSettings>, settings: TriggerMacroSettings) {
    // TODO if any issues from hyperactiv, rip it out and put back the simple loop on settings changes... for 3 buttons is perfectly fine!
    if (action.hyperactiv_state) {
        // logger.debug("Dispose previous state");
        // FYI I am not making settings reactive, not even sure that would be possible/feasible...
        // instead, when the dynamic_type changes, dispose of prior computation and setup new computation 
        // dynamic_type RARELY changes so NBD (no need to complicate this with making the settings reactive!)
        // TODO IIAC attaching the state to the action is the right spot (per button, right?)
        // FYI can verify this works by changing dynamic_type... without this dispose, you'll see extra flicker from previous computations firing before the most recent computation (last added) fires and then updates correctly.. so they appear to fire in ORDER
        //  anyways once you dispose of prior computations, the flickering goes away
        hyperactiv.default.dispose(action.hyperactiv_state);
        delete action.hyperactiv_state;
    }
    action.hyperactiv_state = hyperactiv.default.computed(() => {
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
            else if (type == "rewrite_reasoning_level") {
                const level = config?.ask?.gptoss?.rewrite_reasoning_level;
                action.setTitle(`rewrite:\n${level}`);
                action.setImage(black_dataUrl);
            }
            else if (type == "fim_reasoning_level") {
                const level = config?.ask?.gptoss?.fim_reasoning_level;
                action.setTitle(`FIM:\n${level}`);
                action.setImage(black_dataUrl);
            }
            else if (type == "log_threshold") {
                const threshold = config?.ask?.log_threshold_text;
                action.setTitle(threshold);
                action.setImage(black_dataUrl);
            }
            else if (type == "none") {
                action.setTitle("none");
                action.setImage(black_dataUrl);
            }
            else {
                if (type.length > 8) {
                    // split every 8th char so it shows well enough
                    const split = type.match(/.{1,8}/g)?.join('\n');
                    action.setTitle(split ?? type, {});
                }
                else {
                    action.setTitle('TODO\n' + type, {});
                }
                action.setImage(black_dataUrl);
            }
        } catch (error) {
            logger.error(`💩 Holy crap, something went wrong: ${error}`);
        }
    });
}
