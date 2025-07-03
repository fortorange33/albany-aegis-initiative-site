# Albany Aegis Initiative Site

[![Netlify Status](https://api.netlify.com/api/v1/badges/ed254c35-7733-4044-9144-93a91e5c7817/deploy-status)](https://app.netlify.com/projects/albany-aegis-initiative-netlify/deploys)

## Overview

This is the official site of the **Albany Aegis Initiative**, a civic data and public safety program dedicated to reducing crime, enhancing community trust, and improving local governance in Albany, New York. The site provides transparency tools, interactive visualizations, and civic resources for the public and policymakers.

## Project Structure

```
albany-aegis-initiative-site/
├── index.html             # Root landing page (GitHub Pages entrypoint)
├── assets/
│   ├── css/style.css      # Tailwind-based site stylesheet
│   ├── js/main.js         # JavaScript interactivity and dashboard logic
│   └── images/            # Logos, icons, and SVG visual assets
├── public/                # Static exports (charts, PDFs, favicons)
├── CNAME                  # Custom domain for GitHub Pages
├── README.md              # Project documentation
└── …
```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/fortorange33/albany-aegis-initiative-site.git
cd albany-aegis-initiative-site
```

### 2. Open in Visual Studio Code

- Launch Visual Studio Code.
- Open the `albany-aegis-initiative-site/` project folder.

### 3. Run Locally

- Use the Live Server extension in VS Code for live HTML previews.
- Or manually open the homepage in your browser:

```bash
open index.html
```

## Deployment via GitHub Pages

This site is published from the `main` branch root using GitHub Pages.

### Custom Domain

- Primary domain: https://www.albany.watch
- The custom domain is declared in the root-level `CNAME` file.
- DNS is managed via Cloudflare:
    - `www.albany.watch` → `fortorange33.github.io`
    - `albany.watch` → `www.albany.watch`

## Updating the Live Site

To publish changes:

```bash
git add .
git commit -m "Update homepage layout and dashboard links"
git push origin main
```

GitHub Pages will automatically deploy any commits to the main branch that modify root-level HTML, CSS, or asset files.

## Contributing

- Ensure consistent commit messages and organized file structure.
- Create new HTML components or visualizations in modular sections.
- Document major additions or design changes in this `README.md`.

### Example Commit

```bash
git commit -m "Add arrest heatmap and update style.css for dark mode"
```

### Example Feature Branch Workflow

```bash
git checkout -b feature/community-reporting
git push origin feature/community-reporting
```

## Future Enhancements

- Embed live crime feeds from municipal APIs.
- Add searchable crime stats by neighborhood, race, age, and gender.
- Launch community reporting and feedback tools.
- Integrate transparency and policy audit documents in PDF format.
- Improve accessibility, SEO, and offline access using PWA patterns.

---

Maintained by  
J. Gregory Walsh  
[www.albany.watch](https://www.albany.watch)  
[https://github.com/fortorange33](https://github.com/fortorange33)
