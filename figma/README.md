# Figma Export Files

This folder contains everything you need to bring the PCC Alumni Portal design into Figma.

## Files

| File | Purpose |
|------|---------|
| `design-tokens.json` | Colors, typography, spacing, radii — import via **Tokens Studio for Figma** |
| `design-spec.md` | Full screen inventory, component specs, and layout measurements |

## Quick start

### 1. Import design tokens
1. Open Figma → create a new file.
2. Install plugin: [Tokens Studio for Figma](https://www.figma.com/community/plugin/843461159747178978).
3. Open the plugin → **Settings** → **Import** → choose `design-tokens.json`.
4. Sync tokens to Figma variables/styles.

### 2. Capture live screens (fastest)
1. Run the app: `npm run dev`
2. Install plugin: [html.to.design](https://www.figma.com/community/plugin/1153339859977185268).
3. Enter `http://localhost:5173` and capture each page.

### 3. Build manually
Open `design-spec.md` and recreate screens using the token values and component specs.

## Background image

The login/register background is at:

```
src/imports/bg.png
```

Import this image into Figma for auth screens.
