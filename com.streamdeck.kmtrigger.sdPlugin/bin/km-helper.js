"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardMaestroHelper = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class KeyboardMaestroHelper {
    /**
     * Get all macro groups and macros from Keyboard Maestro
     */
    static async getMacroList() {
        try {
            // Use JXA (JavaScript for Automation) for easier JSON output
            const jxaScript = `
        const km = Application('Keyboard Maestro');
        const groups = [];

        const allGroups = km.macroGroups();

        for (const group of allGroups) {
          const groupData = {
            name: group.name(),
            macros: []
          };

          const macros = group.macros();

          for (const macro of macros) {
            groupData.macros.push({
              name: macro.name(),
              uid: macro.id(),
              modificationDate: Math.floor(macro.modificationDate().getTime() / 1000)
            });
          }

          groups.push(groupData);
        }

        JSON.stringify(groups);
      `;
            const { stdout } = await execAsync(`osascript -l JavaScript -e '${jxaScript.replace(/'/g, "'\\''")}'`);
            const groups = JSON.parse(stdout.trim());
            return groups;
        }
        catch (error) {
            console.error('Failed to get macro list:', error.message);
            // Fallback: try simpler AppleScript approach
            return await this.getMacroListFallback();
        }
    }
    /**
     * Fallback method using traditional AppleScript
     */
    static async getMacroListFallback() {
        try {
            // Simple approach: just get macro names and IDs
            const script = `
        tell application "Keyboard Maestro"
          set output to ""
          set allGroups to every macro group

          repeat with aGroup in allGroups
            set groupName to name of aGroup
            set output to output & "GROUP:" & groupName & "\\n"

            set allMacros to every macro of aGroup

            repeat with aMacro in allMacros
              set macroName to name of aMacro
              set macroUID to id of aMacro

              set output to output & "MACRO:" & macroName & "|" & macroUID & "\\n"
            end repeat
          end repeat

          return output
        end tell
      `;
            const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
            return this.parseSimpleOutput(stdout);
        }
        catch (error) {
            console.error('Fallback also failed:', error.message);
            return [];
        }
    }
    /**
     * Parse simple text output from AppleScript
     */
    static parseSimpleOutput(output) {
        const groups = [];
        let currentGroup = null;
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.startsWith('GROUP:')) {
                if (currentGroup) {
                    groups.push(currentGroup);
                }
                const groupName = line.substring(6).trim();
                currentGroup = {
                    name: groupName,
                    macros: []
                };
            }
            else if (line.startsWith('MACRO:') && currentGroup) {
                const macroData = line.substring(6).trim();
                const [name, uid] = macroData.split('|');
                if (name && uid) {
                    currentGroup.macros.push({
                        name: name.trim(),
                        uid: uid.trim(),
                        modificationDate: Date.now() / 1000
                    });
                }
            }
        }
        if (currentGroup) {
            groups.push(currentGroup);
        }
        return groups;
    }
    /**
     * Execute a Keyboard Maestro macro by UID
     */
    static async executeMacro(uid, param) {
        try {
            let script = `tell application "Keyboard Maestro Engine" to do script "${uid}"`;
            if (param) {
                // Escape quotes in parameter
                const escapedParam = param.replace(/"/g, '\\"');
                script += ` with parameter "${escapedParam}"`;
            }
            const { stdout, stderr } = await execAsync(`osascript -e '${script}'`);
            if (stderr) {
                console.error('Error executing macro:', stderr);
                throw new Error(stderr);
            }
            console.log('Macro executed successfully:', uid);
        }
        catch (error) {
            console.error('Failed to execute macro:', error.message);
            throw error;
        }
    }
}
exports.KeyboardMaestroHelper = KeyboardMaestroHelper;
