import streamDeck, { ApplicationDidLaunchEvent, ApplicationDidTerminateEvent, LogLevel } from "@elgato/streamdeck";

// must add app(s) to ApplicationsToMonitor in manifest.json
// "ApplicationsToMonitor": {
//     "mac": [
//         "com.brave.Browser.beta"
//     ]
// }
streamDeck.system.onApplicationDidLaunch((ev: ApplicationDidLaunchEvent) => {
    streamDeck.logger.info("launch", ev.application);
});
streamDeck.system.onApplicationDidTerminate((ev: ApplicationDidTerminateEvent) => {
    streamDeck.logger.info("terminate", ev.application);
});

streamDeck.system.onDidReceiveDeepLink((ev) => {
    // PRN could use passive links over websocket long term, but the feature needs polished
    // limited to ~2k of "data"
    // FYI right now, even if passive link, if streamdeck app is open it switches to frontmost
    //   and if streamdeck is closed, the frontmost app still loses focus (i.e. iTerm/Brave)
    //   is this a 7.0.3 bug? (current version and no updates)
    // NO remote sources (obviously)... not sure I'd want that!

    console.log('deeplink', ev);

    // TODO! switch to using logger in SDeck
    //  any limitations?
    streamDeck.logger.info('deeper', ev); // shows up in com.wes.streamdeck.sdPlugin/logs/*

    // https://docs.elgato.com/streamdeck/sdk/guides/deep-linking
    //
    // active:
    //   streamdeck://plugins/message/com.wes.streamdeck/hello?name=Elgato#waving
    //
    // passive:
    //   streamdeck://plugins/message/com.wes.streamdeck/hello?streamdeck=hidden
    //    v7 has passive deep link (streamdeck=hidden) but it's not working for me
    //    these won't open streamdeck app (like active links)
    //
    //  ev: {
    //     "type": "didReceiveDeepLink",
    //     "url": {
    //         "fragment": "waving",
    //         "href": "/hello?name=Elgato#waving",
    //         "path": "/hello",
    //         "query": "name=Elgato",
    //         "queryParameters": {}
    //     }
    // }  
    //

});


