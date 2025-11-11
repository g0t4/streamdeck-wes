use AppleScript version "2.4" -- Yosemite (10.10) or later
use scripting additions

tell application "Brave Browser Beta"

	-- get first matching tab in every window (pairs)
	set devtools_tab_per_window_pairs to (first tab of every window whose URL starts with "devtools://")
	set devtools_tab to missing value
	repeat with pair in devtools_tab_per_window_pairs
		log "trying pair: "
		log pair
		if exists (pair) then
			log "Found it"
			set devtools_tab to pair
			exit repeat -- stop when you find one
		end if
	end repeat

	if exists devtools_tab then
		log devtools_tab
		--set URL of devtools_tab to "https://google.com"
		log URL of devtools_tab as string
	end if

end tell
