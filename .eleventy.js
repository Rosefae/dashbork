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

    // Eleventy settings

    return {
        dir: {
            input: "src",
            output: "dist",
            includes: "widgets",
            layouts: "common"
        },
        passthroughFileCopy: true
    }
}