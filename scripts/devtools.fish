#!/usr/bin/env fish

set host 127.0.0.1
set port 12345
set list_url http://$host:$port/json/list
set id $(curl -s $list_url | jq -r '.[0].id') # use ID to build own link
# pre-built URLs too:
set url $(curl -s $list_url | jq -r '.[0].devtoolsFrontendUrl')
set url_prefix $(string replace --regex "$id\$" "" "$url") # strip ID from the end so link matches across restarts

# alternative:
# set url_legacy $(curl -s $list_url | jq -r '.[0].devtoolsFrontendUrlCompat')

echo "
tell application \"Brave Browser Beta\"

    -- set url_prefix to \"devtools://devtools/bundled/inspector.html?ws=$host:$port\"
    set devtools_tab to a reference to (first tab of front window whose URL starts with \"$url_prefix\")
    -- FYI could do first tab of any window, stick with front for now

    if not (exists devtools_tab) then
        set devtools_tab to make new tab of the front window
    end if

    (*
        -- FYI this will work w/o bringing the browser window to the foreground...
        --  BUT YOU CANNOT USE window.location to set HREF to devtools schema
        tell window 1 to tell active tab to execute javascript \"window.location.href='https://google.com';\"
        tell devtools_tab to execute javascript \"window.location.href='devtools://devtools/bundled/inspector.html?ws=$host:$port...';\"
    *)

    -- get current foreground app, so I can switch back to it
    tell application \"System Events\"
        set prior_app to first application process whose frontmost is true
    end tell

    -- make sure devtools page is loaded with latest UUID
    -- this brings Brave to the foreground
    tell devtools_tab to set URL to \"$url\"

    -- switch back to prior app, very fast!
    tell application \"System Events\"
        set frontmost of prior_app to true
    end tell
end tell

" | osascript
