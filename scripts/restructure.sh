#!/usr/bin/env zsh

# Allow unmatched globs
setopt +o nomatch

# Move banner image and favicon into public/
mv 1500x500.jpeg public/ 2>/dev/null
mv favicon.ico public/ 2>/dev/null

# Move HTML content pages into src/pages/
mv about.html contact.html crime-data.html crime-tracker.html index.html resources.html visualizations.html src/pages/ 2>/dev/null

# Move dashboard script into assets/js/
mv live-crime-dashboard.js src/assets/js/ 2>/dev/null

# Remove duplicate style.css in root if it matches assets/css/style.css
if [ -f style.css ] && diff style.css assets/css/style.css > /dev/null; then
  rm style.css
fi

# Restore strict globbing (optional)
setopt -o nomatch

echo "Restructure complete. Root now contains only config files and folders: assets/, public/, src/."
