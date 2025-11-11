## Research

SwitchToProfile - for one off scenarios to open up available keymaps? (can't load user profile, only profiles in plugin's manifest)

## Trigger timing
Investigate if using keyboardmaestro CLI is faster to trigger a macro...

```sh
/Applications/Keyboard\ Maestro.app/Contents/MacOS/keyboardmaestro --help
```

vs AppleScript, etc


## Nice to Haves

- TODO use an env file to change PORTs... i.e. collisions
  - would need to propagate through all usages
  - goal - not checkin so you can have your own port w/o outstanding changes in the repo

- SETUP real hot reload (would have to wrap in plugin setup or smth b/c I can't control plugin process creation)
  - currently this restarts the plugin on every change (which is not hot reload, even though the docs allege it is! https://docs.elgato.com/streamdeck/sdk/guides/actions)
  - I added opening the devtools (albiet annoying) but still convenient 
  - could add watch that rebuilds and then on end restart but not attach devtools if that's annoying

- Set `Category` in manifest.json
  - MUST SET `CategoryIcon` too to use this
  - FYI `CUSTOM` category is FINE FOR NOW!
  - Results in button type showing in its own Group on right side of Elgato button editor
  - Probably I would only need this if I create my own aggregate plugin that has lots of button types (not just kmtrigger)  
