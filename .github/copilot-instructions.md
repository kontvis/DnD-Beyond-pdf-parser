# Copilot / AI Agent Instructions

This repository is a small Node.js service that fetches D&D Beyond character PDFs, parses them with `pdf2json`, and exposes extracted rolls via an Express endpoint. Keep guidance terse and strictly tied to code patterns found in this repo.

- **Entrypoint:** [src/index.js](../src/index.js) — service is ESM (`type: module`), listens on port 8080.
- **How to run (local):** use `yarn start` or `node .` from the repository root. For live reload use `yarn watch` (uses `node-dev`). See [package.json](../package.json).
- **Build:** `yarn build` runs the Docker build defined in `package.json` (tags the image using the package name/version). The repo contains a `dockerfile` at the project root.
- **Linting:** `yarn lint` and `yarn lint:fix` run ESLint on `src`.

Key code patterns and data shapes (use these as authoritative references):

- PDF parsing: `pdf2json` emits `pdfParser_dataReady` with `pdfData.Pages` where each page has `Fields` (array) and `Texts`. Field values are accessed as `field.V` and IDs as `field.id.Id` — see `findValue()` in `src/index.js`.
- Common helpers: `findValue(page, id)`, `getValueList(page, ids)`, `findPage(pages, text)` — prefer using these helpers for new extractors.
- Weapon extraction pattern: regex-based field selection: `/Wpn_Name(_[1-6])?/`, `Wpn[1-6]_AtkBonus`, `Wpn[1-6]_Damage` — copy this approach when adding more weapon-like fields.
- Spell attack lookup: finds the page containing the text `SPELLCASTING` then reads `spellAtkBonus0`.

API surface:

- GET `/rolls?characterId=<id>&source=<source>`
  - `characterId` (required): Character ID.
  - `source` (optional, default `download`): `download` fetches from D&D Beyond; `local` reads from `input_pdfs/<id>.pdf`.
  - Response: JSON with `{ characterName, attacks, abilityChecks, attributes, saves }`.
  - Error codes: missing `characterId` → 400, PDF not found (local) → 400, fetch failure (download) → 400, parse error → 500 with error text.
  - **Local folder parsing:** Added in v1.2.0 — uses `fs.readFileSync()` to load from `input_pdfs/` when `source=local` is set. See [src/index.js](../src/index.js).

Conventions specific to this project:

- Project is intentionally minimal: no tests or separate config files beyond ESLint and Yarn v3 lockfile. Avoid adding heavy infra unless necessary.
- Keep parsing logic synchronous/imperative inside the `pdfParser_dataReady` handler — the code uses event callbacks rather than streaming abstractions.
- Prefer simple arrays/objects for responses (no custom classes). Follow current JSON shape for compatibility.

Integration notes / external dependencies:

- The service depends on network access to `www.dndbeyond.com` to fetch sheet PDFs. Expect failures if that endpoint changes or rate-limits.
- Main runtime deps: `axios`, `express`, `pdf2json` — changes to parsing should reference `pdf2json` output structure.

When editing or extending:

- Add new extraction helpers beside existing ones in `src/index.js` unless extraction grows large; then create a new module under `src/` and import it from `index.js`.
- Run `yarn lint` before committing. Keep changes small and focused — this repository is single-purpose.

Sample quick commands:

```
yarn install
yarn start
curl "http://localhost:8080/rolls?characterId=123456"
yarn lint
yarn build
```

If anything here is unclear or you want guidance on adding new extraction routines, tell me which field(s) you need and I will propose the minimal code changes referencing the existing helpers.
