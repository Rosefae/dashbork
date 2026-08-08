import crypto from "node:crypto";

export default async function (eleventyConfig) {
    // const { RenderPlugin } = await import("@11ty/eleventy");
    // eleventyConfig.addPlugin(RenderPlugin, {
    //     accessGlobalData: true
    // });

    eleventyConfig.setLiquidOptions({
        jsTruthy: true
    })

    // Copy assets

    eleventyConfig.addPassthroughCopy("src/common/fonts");
    eleventyConfig.addPassthroughCopy("src/**/*.css"); // todo: minify
    eleventyConfig.addPassthroughCopy("src/**/*.js"); // todo: minify;

    // Set wrapper

    eleventyConfig.addGlobalData("layout", "wrapper.liquid");

    // Custom shortcodes

    eleventyConfig.addShortcode("uuid", () => {
        return crypto.randomUUID();
    });

    // Eleventy settings

    return {
        dir: {
            input: "src",
            output: "pages",
            includes: "widgets",
            layouts: "common"
        },
        passthroughFileCopy: true
    }
}