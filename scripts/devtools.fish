#!/usr/bin/env fish

set host 127.0.0.1
set port 12345
set list_url http://$host:$port/json/list
set id $(curl -s $list_url | jq -r '.[0].id') # use ID to build own link
# pre-built URLs too:
set url $(curl -s $list_url | jq -r '.[0].devtoolsFrontendUrl')
set url_prefix $(string replace --regex "$id\$" "" "$url") # strip ID from the end so link matches across restarts
echo "URL: '$url'"
if test -z "$url"
    echo "CRAP the URL is missing, most likely the plugin exploded on startup:"
    echo "    pgrep -ilfa kmtrigger"
    echo "    npm run logs-sdjson-kmtrigger # will mention failed to start"
    echo '      OFTEN A DUMB message like: {"func":"std::string esd::plugins::Storage::load(bool, const std::filesystem::path &)","internal_error":"","kpi_message":null,"level":"error","message":"Import error at \'.../Library/Application Support/com.elgato.StreamDeck/Plugins/com.wes.streamdeck.sdPlugin\'","module":"Plugins","msg_type":"text","skipped":{"duration":0,"skip_counter":0,"unit":"microseconds"},"thread_id":15994015,"timestamp":"2025-11-11T05:36:06.303-06:00","trace_depth":{"depth":0,"type":"none"}}'
    echo "      i.e. trailing comma in manifest.json and it will not mention that in the logs, it will just say Import error?!"
    echo "    npm run validate # good starting point if plugin isn't starting"
    echo "    npm run restart"
    echo
    exit
end

argparse show -- $argv
# if --show passed, then it will be in _flag_show variable 
# echo $_flag_show

# alternative:
# set url_legacy $(curl -s $list_url | jq -r '.[0].devtoolsFrontendUrlCompat')

set script "
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
end tell
"

if not set -q _flag_show
    # do not switch back to original app if --show passed
    set script $script "
tell application \"System Events\"
    set frontmost of prior_app to true
end tell
"
end

echo $script | osascript
