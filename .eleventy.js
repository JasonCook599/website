const CleanCSS = require("clean-css")
const {
  minify
} = require("terser")
const htmlmin = require("html-minifier")
const markdownIt = require("markdown-it")
const markdownItAttrs = require("markdown-it-attrs")
const markdownItOptions = {
  html: true,
  breaks: true,
  linkify: true
}
const markdownLib = markdownIt(markdownItOptions).use(markdownItAttrs)
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets")
  eleventyConfig.addPassthroughCopy({
    "images/**/*": "/img"
  })
  eleventyConfig.addPassthroughCopy("functions")
  eleventyConfig.setLibrary("md", markdownLib)
  eleventyConfig.addTransform("minify-output", async function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      })
      return minified
    } else if (outputPath && outputPath.endsWith(".css")) {
      return new CleanCSS().minify(content).styles
    } else if (outputPath && outputPath.endsWith(".js")) {
      var result = await minify(content)
      return result.code
    } else {
      return content
    }
  })
}
