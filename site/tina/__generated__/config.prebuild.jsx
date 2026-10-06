// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var cats = ["motherhood", "marriage", "meals", "breakfast", "lunch", "dinner"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
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
        ui: { filename: { slugify: (v) => (v?.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } },
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "datetime", name: "date", label: "Publish date", required: true },
          { type: "string", name: "categories", label: "Categories", list: true, options: cats },
          { type: "image", name: "image", label: "Cover photo" },
          { type: "string", name: "excerpt", label: "Short summary (shown on cards)", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "Write your post", isBody: true }
        ]
      },
      {
        name: "settings",
        label: "Homepage & Announcement",
        path: "src/content",
        format: "json",
        match: { include: "settings" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "registerUrl", label: "Class sign-up link" },
          { type: "object", name: "announcement", label: "Top announcement bar", fields: [
            { type: "boolean", name: "show", label: "Show the bar" },
            { type: "string", name: "text", label: "Bold text" },
            { type: "string", name: "linkText", label: "Link text" }
          ] },
          { type: "object", name: "hero", label: "Big welcome banner", fields: [
            { type: "string", name: "title", label: "Headline" },
            { type: "string", name: "intro", label: "Intro text", ui: { component: "textarea" } }
          ] },
          { type: "object", name: "classCard", label: "Kids class card", fields: [
            { type: "boolean", name: "show", label: "Show the card" },
            { type: "string", name: "label", label: "Small label" },
            { type: "string", name: "title", label: "Title" },
            { type: "string", name: "text", label: "Description", ui: { component: "textarea" } },
            { type: "string", name: "buttonText", label: "Button text" }
          ] }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
