import { exec } from 'child_process';
import { promisify } from 'util';
import plist from 'plist'

const execAsync = promisify(exec);

export interface MacroGroup {
    name: string;
    macros: Macro[];
}

export interface Macro {
    name: string;
    uid: string;
    modified: number;
}

export class KeyboardMaestroHelper {

    public static async getMacroList(): Promise<MacroGroup[]> {
        try {
            // gets xml (plist) data from Keyboard Maestro for all macros (grouped)
            // similar to ~/Library/Application Support/Keyboard Maestro/Keyboard Maestro Engine.plist
            //   PRN if applescript overhead is slow, just go right to the file on disk?
            // FYI asstring returns xml text (w/o this set, you can get binary data)...
            //   if binary is faster, use that
            const script = `tell application "Keyboard Maestro Engine" to getmacros with asstring`;
            const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`);
            return this.parseMacroGroupsXml(stdout);
        } catch (error: any) {
            console.error('Fallback also failed:', error.message);
            return [];
        }
    }

    private static parseMacroGroupsXml(output: string): MacroGroup[] {
        let parsedList: any;
        try {
            parsedList = plist.parse(output);
        } catch (e) {
            console.error('Failed to parse plist:', e);
            return [];
        }

        if (!Array.isArray(parsedList)) {
            console.error('Unexpected plist structure, expected an array of groups');
            return [];
        }

        const groups: MacroGroup[] = [];

        for (const group of parsedList) {
            const groupName = typeof group.name === 'string' ? group.name : 'Unnamed Group';
            const macrosArray = Array.isArray(group.macros) ? group.macros : [];

            const macros: Macro[] = macrosArray.map((macro: any) => ({
                name: typeof macro.name === 'string' ? macro.name : 'Unnamed Macro',
                uid: typeof macro.uid === 'string' ? macro.uid : 'MISSING UUID???',
                modified:
                    typeof macro.modified === 'number'
                        ? macro.modified
                        : Math.floor(Date.now() / 1000)
            }));

            groups.push({
                name: groupName,
                macros: macros
            });
        }

        console.log(`Parsed ${groups.length} groups, total macros: ${groups.reduce((c, g) => c + g.macros.length, 0)}`);
        return groups;
    }

    static async executeMacro(uid: string, param?: string): Promise<void> {
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
        } catch (error: any) {
            console.error('Failed to execute macro:', error.message);
            throw error;
        }
    }
}
