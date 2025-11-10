# Stream Deck Keyboard Maestro Plugin

A Stream Deck plugin to trigger Keyboard Maestro macros with a button press.

## Features

- Execute Keyboard Maestro macros directly from Stream Deck buttons
- Browse and select macros organized by groups
- View last modified macro at the top for quick access
- Pass optional parameters to macros
- Refresh macro list with a button click

## Requirements (tested with, minimums)

- macOS 15.6.1
- Stream Deck 7.0
- Keyboard Maestro 11
- Node.js 20.19.0 (bundled with Stream Deck)
    - Check installed version, i.e. 'ls /Applications/Elgato Stream Deck.app/Contents/Helpers/node20'

## Usage

1. Drag the "Trigger KM Macro" action onto a Stream Deck button
2. In the property inspector:
   - Select a macro from the dropdown (organized by groups)
   - Optionally add a parameter to pass to the macro
   - Click the refresh button to reload the macro list
3. Press the button to execute the selected macro

## Development

### Project Structure

```
.
├── src/
│   ├── plugin.ts          # Main plugin code
│   └── km-helper.ts       # Keyboard Maestro integration
├── com.wes.kmtrigger.sdPlugin/
│   ├── manifest.json      # Plugin manifest
│   ├── pi.html           # Property Inspector UI
│   ├── bin/              # Compiled JavaScript
│   └── *.png, *.svg, *.css  # Assets
├── package.json
└── tsconfig.json
```

### Setup

```bash
npm install

npm run build

# install streamdeck CLI
npm install -g @elgato/cli@latest
# provides streamdeck command:
streamdeck --help

# * link to use in StreamDeck
npm run link # uses streamdeck link under the hood
streamdeck list # confirm linked
# or check plugins dir:
ls ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins

# * restart sandboxed plugin process
npm run restart # (re)start plugin
# https://github.com/elgatosf/cli/blob/main/src/commands/restart.ts (source for restart command), uses:
open streamdeck://plugins/restart/com.wes.kmtrigger # alternative

npm run validate # check if any issues w/ streamdeck validate CLI

npm run watch # auto build on changes

# see package.json for more actions, many link to streamdeck CLI
```

### Pickup Changes

- `pi.html` - Just switch buttons in the StreamDeck button editor app to reload the Property Inspector page (HTML/css/etc)
    - Like refreshing a browser tab 

### Logs

```fish

# Ensure plugin is running (node process)
pgrep -ilfa "com.wes.kmtrigger"
# IF it's not running, then check logs (next)
# BTW, CLI args has devtools port to inspect 
# TODO confirm # IIAC restart command restarts this process

# TODO check how rollover works on log files, is the StreamDeck.json always latest logs? or the .0/.1/.2 etc?
npm run logs-sdjson-kmtrigger
# see package.json for more log commands
# should give you exit code / reason if it failed on restart

```


### How it Works

1. **Plugin Backend** (`src/plugin.ts`):
   - Connects to Stream Deck via WebSocket
   - Handles button press events
   - Queries Keyboard Maestro for macro lists
   - Executes macros via AppleScript

2. **Keyboard Maestro Integration** (`src/km-helper.ts`):
   - Uses JXA (JavaScript for Automation) to query KM for available macros
   - Falls back to traditional AppleScript if JXA fails
   - Executes macros using AppleScript: `tell application "Keyboard Maestro Engine" to do script "<uid>"`

3. **Property Inspector** (`pi.html`):
   - Provides UI for selecting macros and entering parameters
   - Communicates with plugin backend via WebSocket
   - Organizes macros by groups with last-modified macro at the top

## Troubleshooting

- Check Stream Deck logs: `~/Library/Logs/ElgatoStreamDeck`
- Restart Stream Deck software
- Ensure Keyboard Maestro Engine is running

## Credits

UI design inspired by [KMlink](https://github.com/Corcules/KMlink) by Corcules.

## License

MIT
