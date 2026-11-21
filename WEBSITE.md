# wizminar.com

Source for [wizminar.com](https://wizminar.com), my personal site, styled as a noir comic, Issue #1.

## Structure

```
index.html        page markup
css/style.css     all styles (black + orange theme)
js/main.js        intro, hero parallax, cursor, nav highlight, copy-email
assets/           character art and images
```

Plain HTML, CSS and JavaScript. No build step and no dependencies apart from Google Fonts (Archivo and Permanent Marker).

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Editing

- **Projects:** the `#work` section in `index.html`
- **Lore timeline:** the `#lore` section in `index.html`
- **Things Wiz says when you click the bubble:** the `lines` array in `js/main.js`
- **Colors:** the `:root` tokens at the top of `css/style.css`
