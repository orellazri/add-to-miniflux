default:
    @just --list

# Validate extension JavaScript and manifests
check:
    node --check extension/chrome/popup.js
    node --check extension/chrome/options.js
    node --check extension/firefox/popup.js
    node --check extension/firefox/options.js
    node -e "JSON.parse(require('fs').readFileSync('extension/chrome/manifest.json', 'utf8')); JSON.parse(require('fs').readFileSync('extension/firefox/manifest.json', 'utf8'))"

# Release a new version of the extension (chrome or firefox)
release-extension browser:
    bash scripts/release-extension.sh {{ browser }}
