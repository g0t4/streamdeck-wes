import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "node:path";
import url from "node:url";

const isWatching = !!process.env.ROLLUP_WATCH;
const sdPlugin = "com.wes.kmtrigger.sdPlugin";

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    // treeshake: { moduleSideEffects: true }, // rollup is just dropping modules if an export isn't used... so if I remove the function call to webby.ts's startExternalServer... rollup just says FUCK IT DROP THE WHOLE THING SIDE EFFECTS BE DAMNED!
    //  this setting didn't do shit to fix anything and I don't care for now, but just heads up, rollup is gonna give you surprise butt sex when you least expect it
    //  I am a fucking idiot for copying it over... FML
    //  all for a hook on watch... so can open devtools after restart... SUCH A POS workflow
    
    input: "src/plugin.ts",
    output: {
        file: `${sdPlugin}/bin/plugin.js`,
        sourcemap: isWatching,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
            return url.pathToFileURL(
                path.resolve(path.dirname(sourcemapPath), relativeSourcePath),
            ).href;
        },
    },
    plugins: [
        {
            name: "watch-externals",
            buildStart: function () {
                this.addWatchFile(`${sdPlugin}/manifest.json`);
            },
        },
        typescript({
            mapRoot: isWatching ? "./" : undefined,
        }),
        nodeResolve({
            browser: false,
            exportConditions: ["node"],
            preferBuiltins: true,
        }),
        commonjs(),
        !isWatching && terser(),
        {
            name: "emit-module-package-file",
            generateBundle() {
                this.emitFile({
                    fileName: "package.json",
                    source: `{ "type": "module" }`,
                    type: "asset",
                });
            },
        },
    ],
};

export default config;
