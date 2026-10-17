// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var cats = ["motherhood", "marriage", "meals", "breakfast", "lunch", "dinner"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
var slugify = (v) => (v?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
var embeds = [
  {
    name: "video",
    label: "Video",
    match: { start: "{{<", end: ">}}" },
    ui: { defaultItem: { url: "", caption: "" } },
    fields: [
      { type: "string", name: "url", label: "Paste a YouTube or Vimeo link", description: "Easiest for long videos. Or leave this empty and choose a video file below." },
      { type: "image", name: "file", label: "Or upload a short video file (MP4, under about 50 MB)" },
      { type: "string", name: "caption", label: "Caption (optional)" }
    ]
  },
  {
    name: "photo",
    label: "Photo with caption",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "image", name: "src", label: "Photo" },
      { type: "string", name: "alt", label: "Describe the photo (helps blind readers and Google)" },
      { type: "string", name: "caption", label: "Caption (optional)" },
      { type: "string", name: "size", label: "Size", options: [{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "full", label: "Full width" }] },
      { type: "string", name: "align", label: "Position", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] }
    ]
  },
  {
    name: "photoRow",
    label: "Photos side by side (2\u20133)",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "image", name: "photo1", label: "Photo 1" },
      { type: "string", name: "alt1", label: "Describe photo 1" },
      { type: "image", name: "photo2", label: "Photo 2" },
      { type: "string", name: "alt2", label: "Describe photo 2" },
      { type: "image", name: "photo3", label: "Photo 3 (optional)" },
      { type: "string", name: "alt3", label: "Describe photo 3" }
    ]
  },
  {
    name: "button",
    label: "Button",
    match: { start: "{{<", end: ">}}" },
    fields: [
      { type: "string", name: "label", label: "Button text" },
      { type: "string", name: "url", label: "Where it goes (link)" },
      { type: "string", name: "align", label: "Position", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }] }
    ]
  }
];
var router = ({ document }) => `/${document._sys.filename}/`;
var color = { component: "color", colorFormat: "hex" };
var link = [
  { type: "string", name: "label", label: "Menu text", required: true },
  { type: "string", name: "href", label: "Link (e.g. /about-me/ or https://\u2026)", required: true }
];
var config_default = defineConfig({
  branch,
  clientId: "01789bf2-d73e-4861-a4f9-5960dbbd6392",
  token: process.env.TINA_TOKEN,
  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "img", publicFolder: "public" } },
  schema: {
    collections: [
      {
        name: "post",
        label: "Blog Posts",
        path: "src/content/posts",
        format: "md",
        ui: { filename: { slugify }, router, allowedActions: { createNestedFolder: false } },
        defaultItem: () => ({ date: (/* @__PURE__ */ new Date()).toISOString(), categories: [], draft: false, featured: false }),
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "boolean", name: "draft", label: "Hide this post for now (draft)", description: "Turn on to save without publishing. Turn off and Save to publish." },
          { type: "datetime", name: "date", label: "Date shown on the post", required: true },
          { type: "string", name: "categories", label: "Categories (tick any)", list: true, options: cats },
          { type: "image", name: "image", label: "Cover photo" },
          { type: "string", name: "excerpt", label: "Short summary (shown on cards)", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "Write your post", isBody: true, templates: embeds, toolbarOverride: ["heading", "link", "image", "quote", "ul", "ol", "bold", "italic", "hr", "embed"] },
          { type: "datetime", name: "publishDate", label: "Schedule: hide until this date (optional)", description: "Leave empty to publish immediately. A scheduled post appears the next time the site updates after this date." },
          { type: "string", name: "description", label: "Search-engine description (optional)", ui: { component: "textarea" } },
          { type: "boolean", name: "featured", label: "Feature this post at the top of the home page" }
        ]
      },
      {
        name: "page",
        label: "Pages",
        path: "src/content/pages",
        format: "md",
        ui: { filename: { slugify }, router, allowedActions: { delete: false, createNestedFolder: false } },
        fields: [
          { type: "string", name: "title", label: "Page title", isTitle: true, required: true },
          { type: "image", name: "image", label: "Top photo" },
          { type: "rich-text", name: "body", label: "Page content", isBody: true, templates: embeds, toolbarOverride: ["heading", "link", "image", "quote", "ul", "ol", "bold", "italic", "hr", "embed"] },
          { type: "boolean", name: "showRegisterCta", label: 'Show the "Register" box and button on this page' },
          { type: "string", name: "description", label: "Search-engine description (optional)", ui: { component: "textarea" } },
          { type: "boolean", name: "draft", label: "Draft \u2014 keep hidden from the website" }
        ]
      },
      {
        name: "settings",
        label: "Site Settings",
        path: "src/content",
        format: "json",
        match: { include: "settings" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "siteTitle", label: "Site name" },
          { type: "image", name: "logo", label: "Logo" },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "object", name: "theme", label: "Colors & fonts", fields: [
            { type: "string", name: "accent", label: "Accent color (buttons, links)", ui: color },
            { type: "string", name: "dark", label: "Headline color", ui: color },
            { type: "string", name: "text", label: "Body text color", ui: color },
            { type: "string", name: "soft", label: "Soft background color", ui: color },
            { type: "string", name: "headingFont", label: "Headline font", options: ["Outfit", "Poppins", "Montserrat", "Playfair Display", "Lora", "DM Sans"] },
            { type: "string", name: "bodyFont", label: "Body font", options: ["Heebo", "Inter", "Nunito", "Open Sans", "DM Sans", "Lora"] }
          ] },
          { type: "object", name: "nav", label: "Menu", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: [
            ...link,
            { type: "object", name: "children", label: "Drop-down items", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: link }
          ] },
          { type: "string", name: "registerUrl", label: "Class sign-up link" },
          { type: "object", name: "announcement", label: "Top announcement bar", fields: [
            { type: "boolean", name: "show", label: "Show the bar" },
            { type: "string", name: "text", label: "Bold text" },
            { type: "string", name: "linkText", label: "Link text" }
          ] },
          { type: "object", name: "hero", label: "Home page welcome banner", fields: [
            { type: "image", name: "image", label: "Background photo" },
            { type: "string", name: "title", label: "Headline" },
            { type: "string", name: "intro", label: "Intro text", ui: { component: "textarea" } }
          ] },
          { type: "object", name: "classCard", label: "Kids class card", fields: [
            { type: "boolean", name: "show", label: "Show the card" },
            { type: "image", name: "image", label: "Card photo" },
            { type: "string", name: "label", label: "Small label" },
            { type: "string", name: "title", label: "Title" },
            { type: "string", name: "text", label: "Description", ui: { component: "textarea" } },
            { type: "string", name: "buttonText", label: "Button text" },
            { type: "string", name: "stickyText", label: "Text on the bottom bar (phones)" }
          ] },
          { type: "string", name: "mobileCta", label: "Phone menu: top button text" },
          { type: "object", name: "recentPosts", label: "Home page: recent posts", fields: [
            { type: "boolean", name: "show", label: "Show this section" },
            { type: "string", name: "title", label: "Section title" },
            { type: "number", name: "count", label: "How many posts" }
          ] },
          { type: "string", name: "featuredTitle", label: "Home page: title for the featured post" },
          { type: "object", name: "categoriesSection", label: "Home page: category tiles", fields: [
            { type: "boolean", name: "show", label: "Show this section" },
            { type: "string", name: "title", label: "Section title" },
            { type: "object", name: "items", label: "Tiles", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: [
              { type: "string", name: "label", label: "Name" },
              { type: "string", name: "slug", label: "Category (marriage, motherhood, meals, breakfast, lunch, dinner)" },
              { type: "image", name: "image", label: "Photo" }
            ] }
          ] },
          { type: "string", name: "footerText", label: "Footer text" },
          { type: "object", name: "social", label: "Social links (footer)", list: true, ui: { itemProps: (i) => ({ label: i?.label }) }, fields: [
            { type: "string", name: "label", label: "Name (e.g. Instagram)" },
            { type: "string", name: "url", label: "Link" }
          ] }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
