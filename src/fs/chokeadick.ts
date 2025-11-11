import chokidar, { FSWatcher } from "chokidar";
import fs from "node:fs";
import path from "node:path";
import { homedir } from "os";
import { streamDeck } from "@elgato/streamdeck";

const dir = path.resolve(path.join(homedir(), ".local/share/streamdeck-wes/"));

const logger = streamDeck.logger.createScope("fs.chokeadick");

function muhk_dir_pee(dir: string) {
    if (fs.existsSync(dir))
        return;

    try {
        fs.mkdirSync(dir, { recursive: true });
        logger.info("🎉 💪 I muhked the dir: " + dir);
    } catch (error) {
        logger.error("well 💩... I couldn’t muhk the dir: ", error);
    }
}

export function chokit() {

    muhk_dir_pee(dir);

    const watcher = chokidar.watch(dir, {
        persistent: true,
        ignoreInitial: false, // this is initial sync (triggers for each existing file, unless disabled)
        useFsEvents: true,  // native macOS watcher
        awaitWriteFinish: { stabilityThreshold: 75, pollInterval: 10 },
        depth: 1,
    });

    watcher.on("ready", function () {
        logger.info("ready");
    });

    watcher.on("add", function (filePath: string, stats?: fs.Stats) {
        logger.info("add", filePath);
        readFile(filePath, stats);
    });

    watcher.on("change", function (filePath: string, stats?: fs.Stats) {
        logger.info("change", filePath);
        readFile(filePath, stats);
    });

    // unlike == remove
    // watcher.on("unlink", function (filePath: string, stats?: fs.Stats) {
    //     logger.info("unlink", filePath);
    // });

    function readFile(path: string, stats?: fs.Stats) {
        try {
            const text = fs.readFileSync(path, "utf8");
            logger.info("text", text);
            const data = JSON.parse(text);
            logger.info('Got data:', data);
            // handleUpdate(path.basename(filePath), data);
        } catch (err) {

            // avoid spamming errors if file mid-write (wait and see how often this happens):
            //    if (!/Unexpected end/.test(err.message)) {

            logger.error(err);
        }
    }
}


