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
    eleventyConfig.addPassthroughCopy("src/common/images");
    eleventyConfig.addPassthroughCopy("src/**/*.css"); // todo: minify
    eleventyConfig.addPassthroughCopy("src/**/*.js"); // todo: minify;

    // Global page settings

    eleventyConfig.addGlobalData("layout", "wrapper.liquid");

    eleventyConfig.addGlobalData("permalink", () => {
        return (data) => `${data.page.filePathStem}.${data.page.outputFileExtension}`;
    });
    
    // Custom shortcodes and filters

    eleventyConfig.addShortcode("uuid", () => {
        return crypto.randomUUID();
    });

    eleventyConfig.addFilter("boolean", (value) => {
        if (value == 0) return false;
        if (value == undefined) return false;
        if (value == "") return false;

        return true;
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