# Rainy

A lightweight desktop notes app inspired by Apple Notes. Cross-platform alternative with cloud sync support.

## Features

- Rich text editing (bold, italic, underline, headings, lists)
- Task lists with checkboxes
- Nested folder organization
- Resizable images (drag edges to resize)
- Clickable links (open in default browser)
- Inline code formatting (wrap text in backticks)
- Auto-save with debouncing
- Dark/light theme toggle
- Apple Notes webview integration (access iCloud Notes)
- MongoDB Atlas sync with local fallback

## Setup

### Install dependencies

```
npm install
```

### Run in development

```
npm run dev
```

### Build for production

```
npm run build
```

## MongoDB Sync (Optional)

To sync notes across devices:

1. Create a free MongoDB Atlas account
2. Create a cluster and get your connection string
3. In the app, click the Settings icon in the header
4. Paste your connection string and click Save

Notes are always saved locally as backup, even when synced to MongoDB.

## Tech Stack

- Electron
- React
- Tiptap (rich text editor)
- Vite
- MongoDB (optional)
