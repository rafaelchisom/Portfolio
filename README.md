# Raphael Ariguzor — Portfolio

A static portfolio site: `index.html`, `styles.css`, `script.js` and `favicon.svg`. No build step and no dependencies. Fonts load from Google Fonts.

## Preview locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Host on Render

1. Push this folder to a GitHub repository.
2. In Render, choose **New → Static Site** and connect the repository.
3. Use these settings:
   - **Build Command:** leave empty, or `echo "no build"`
   - **Publish Directory:** `.`
4. Click **Create Static Site**. Static sites are free on Render.

Every push to the connected branch redeploys the site.

## Editing

- **Projects:** each project is an `<li class="project">` in `index.html`. Its `data-tags` (`web`, `mobile`, `data`) control which filter button shows it.
- **Colours and fonts:** the variables at the top of `styles.css`. The `@media (prefers-color-scheme: dark)` block holds the dark-mode colours.
