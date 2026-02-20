# saHomeschooling-Services
Find the best Home schooling services offered across South Africa 

# SAH Directory — Shared Footer

Drop-in footer component for every page in the SA Homeschooling Directory.

---

## File structure

```
project/
├── css/
│   └── footer.css          ← all footer styles
└── shared/
    └── footer.html         ← footer markup (no styles, no scripts)
```

---

## How to use on any page

**1. In `<head>` — add the stylesheet and Font Awesome (if not already loaded):**

```html
<link rel="stylesheet" href="css/footer.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

**2. Before `</body>` — add the mount point and loader:**

```html
<div id="sah-footer-root"></div>
<script>
  fetch('shared/footer.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('sah-footer-root').innerHTML = html;
    });
</script>
```

That's it. The footer automatically inherits `--accent` and `--accent-dark` from your page's CSS variables, so it stays on-brand with zero extra work.

---

## Customising the accent colour

The footer reads `--accent` and `--accent-dark` from `:root`. Just make sure your page defines them:

```css
:root {
  --accent:      #c0234a;
  --accent-dark: #96183a;
}
```

---

## Notes

- **`fetch()` requires a server** — it won't work when opening files directly via `file://` in your browser. Use VS Code Live Server, XAMPP, or any local dev server.
- Font Awesome 6.5+ must be loaded on the page for the icons to render.
- The footer is fully responsive: 4-column grid → 2-column at 1024px → single column at 640px.

# SAH Directory — Shared Footer

Drop-in footer component for every page in the SA Homeschooling Directory.
**Self-contained** — styles are embedded directly in `footer.html`, so no separate CSS file needed.

---

## How to use on any page

**1. Make sure Font Awesome 6.5 is in your `<head>` (if not already):**

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

**2. Before `</body>` — add the mount point and loader:**

```html
<div id="sah-footer-root"></div>
<script>
  fetch('shared/footer.html')
    .then(r => r.text())
    .then(html => {
      document.getElementById('sah-footer-root').innerHTML = html;
    });
</script>
```

That's it. No separate CSS file required — styles are bundled inside `footer.html`.

---

## Accent colour

The footer reads `--accent` and `--accent-dark` from your page's `:root`. Define them once per page and the footer matches automatically:

```css
:root {
  --accent:      #c0234a;
  --accent-dark: #96183a;
}
```

---

## Notes

- `fetch()` requires a local server — it won't work over bare `file://` URLs.
  Use **VS Code Live Server**, XAMPP, or any dev server.
- Font Awesome 6.5+ must be loaded for icons to render.
- The footer is fully responsive: 4-col → 2-col at 1024px → 1-col at 640px.
