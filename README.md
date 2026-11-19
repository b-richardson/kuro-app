# 🖤 Kuro: a visual template builder for Obsidian

I got tired of remembering Obsidian's markdown syntax every time I wanted a template, so I built a full-stack web app that does it for me. Drag and drop simple blocks (headings, text, links, search, and more), watch a live preview update as you go, and export a template that comes out 1-to-1 in your vault. No markup required. ✨

> 📌 **Status:** I launched this and sold access to it, but I'm no longer maintaining it. The hosted version is offline. The code is here as a look at what I built and how.

<!-- 📸 Add screenshots or a short screen recording here -->

## ✨ What it does

- 🧱 **Block-based editor.** Build a template out of blocks you can drag, drop, and reorder instead of writing markdown by hand.
- 👀 **Live preview.** A preview panel built to render the way Obsidian does, so what you build is what you get in your vault.
- 💾 **Save, autosave, and export.** Templates are stored per user, autosaved as you work, and exportable whenever you're ready.
- 📚 **Pre-made templates.** A library of ready-to-use templates to start from.
- 👤 **Member accounts and payments.** Sign-in, profiles, and paid access.
- 🪟 **Glassmorphism-style UI.** Frosted-glass look, built before it was cool. 😎

## 🛠️ Tech stack

| Layer | What I used |
| --- | --- |
| 🎨 Front end | Vue 3, TypeScript, Vite, Pinia, Vue Router |
| ✍️ Editing and preview | TipTap, CodeMirror 6, markdown-it, Mermaid, KaTeX |
| 🧲 Drag and drop | SortableJS, vue-draggable-next |
| 🗄️ Back end | Supabase (auth and database) |
| 💳 Payments | Stripe |
| 🧰 Misc | date-fns, lodash-es, yaml, Swiper, Axios |

## 🧠 How it works

Every template is stored as an **ordered list of blocks** on the back end. Each block knows its own type and settings (a heading, some text, a link, a search, and so on). When you save, reorder, or export, that list is serialized into Obsidian-flavored markdown. The live preview renders the same output through a customized markdown pipeline, so the preview and the exported file stay in sync.

## 🚀 Running it locally

```bash
git clone https://github.com/b-richardson/kuro-app.git
cd kuro-app
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

⚠️ The Supabase project and Stripe setup this ran on have been shut down, so to run the full app you'll need to point it at your own Supabase project and Stripe test keys. See `.env.example` for the variables it expects.

## 💭 Looking back

This was a really fun project to build, start to finish: idea, UI, back end, payments, launch. The biggest lesson wasn't technical. Getting people to find a niche app is a whole different challenge from building it, and validating demand is hard when you're mostly scratching your own itch. I'd do that part earlier next time. 🙌

## 📄 License

No license has been added, so all rights are reserved. If you'd like to reuse something from this repo, feel free to reach out.
