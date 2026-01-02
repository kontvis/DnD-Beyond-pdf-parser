# Release Notes — v1.0

Release date: 2026-01-01

Summary
- Initial v1.0 release of the `dnd-beyond-pdf-parser` tool. This release provides a small, single-purpose Node.js service and CLI helpers to extract character data from D&D Beyond character sheet PDFs.

Highlights
- HTTP API: GET `/rolls?characterId=<id>&source=<source>`
  - Default `source=download` (fetches `https://www.dndbeyond.com/sheet-pdfs/<id>.pdf`).
  - `source=local` reads PDFs placed in the `input_pdfs/` directory.
  - Response JSON contains `{ characterName, attacks, abilityChecks, attributes, saves }`.
- Local batch parsing: `yarn parse:folder` parses all PDFs in `input_pdfs/` and writes JSON to `output_json/`.
- CLI & helper: added `src/parser.js` (exports `parsePdfBuffer`) and `scripts/parse_folder.js`.
- Developer convenience: `setup.sh` bootstraps environment (Node + corepack → Yarn) and runs `yarn install`.
- Documentation: `README.md` and `.github/copilot-instructions.md` include usage, patterns, and guidance for AI agents.

Files added/changed (not exhaustive)
- `src/index.js` — main Express app with PDF parsing logic and `source` support
- `src/parser.js` — reusable PDF -> JSON parser
- `scripts/parse_folder.js` — batch parser CLI
- `setup.sh` — environment setup helper (uses corepack to ensure Yarn)
- `README.md`, `.github/copilot-instructions.md` — docs and AI guidance

Usage
- Start the server (after running `./setup.sh` once):

```bash
yarn start
curl "http://localhost:8080/rolls?characterId=123456&source=download"
curl "http://localhost:8080/rolls?characterId=My%20Local%20File&source=local"
```

- Batch-parse local PDFs:

```bash
yarn parse:folder
# results will be written to output_json/<pdf-basename>.json
```

Notes & limitations
- No automated tests included in v1.0 — parsing logic is small and colocated; consider adding unit tests for `src/parser.js` in a future release.
- The parser depends on `pdf2json`'s output format (fields under `Fields[].id.Id` and `Fields[].V`). If PDF structure changes, parsers will need updates.
- Network dependency: `source=download` relies on `www.dndbeyond.com` and may be subject to rate-limiting or sheet-format changes.
- Minimal error handling: current responses return plain text for failures; consider structured error payloads if integrating with other systems.

Suggested next steps (future releases)
- Add unit tests for `parsePdfBuffer` and CI workflow.
- Add CLI flags: parse a single file, recursive input folders, and configurable output path.
- Add versioning/changelog automation and GitHub release tagging on publish.

Contact
- If you want changes or have a PDF that doesn't parse correctly, open an issue or paste the PDF filename and I'll help adjust the parser.
