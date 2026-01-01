# dnd-beyond-pdf-parser

Small Node.js service that downloads D&D Beyond character PDFs, parses them with `pdf2json`, and exposes extracted rolls and stats via a simple HTTP API.

**Entrypoint:** [DnD-Beyond-pdf-parser/src/index.js](DnD-Beyond-pdf-parser/src/index.js#L1-L400)

Quick start

```bash
yarn install
yarn start    # runs node . (listens on port 8080)
# or for live reload:
yarn watch
```

Build (Docker)

```bash
yarn build    # runs docker build using the repo dockerfile
```

API

- GET `/rolls?characterId=<id>`
  - Downloads `https://www.dndbeyond.com/sheet-pdfs/<id>.pdf`, parses it, and returns JSON.
  - Error codes: missing `characterId` → 400, fetch failure → 400, parse failure → 500.

Example

```bash
curl "http://localhost:8080/rolls?characterId=123456"
```

Example response shape

```json
{
  "characterName": "Alice",
  "attacks": [{ "name": "Shortsword", "roll": 5, "damage": "1d6" }],
  "abilityChecks": [{ "name": "Initiative", "roll": 3 }],
  "attributes": [{ "name": "Strength", "roll": 12 }],
  "saves": [{ "name": "Dexterity Save", "roll": 2 }]
}
```

Development notes

- The parser relies on `pdf2json` events (`pdfParser_dataReady`) and uses the `Fields[].id.Id` and `Fields[].V` convention. See helper functions in [src/index.js](DnD-Beyond-pdf-parser/src/index.js#L1-L400) (`findValue`, `getValueList`, `findPage`).
- Linting: `yarn lint` / `yarn lint:fix` (ESLint configured for `src`). See [package.json](DnD-Beyond-pdf-parser/package.json#L1-L200).
- Keep parsing logic small and colocated with the handlers; if it grows, add a new module under `src/` and import it from `index.js`.

Dependencies

- Runtime: `axios`, `express`, `pdf2json` (declared in [package.json](DnD-Beyond-pdf-parser/package.json#L1-L200)).

Notes for AI contributors

- See [`.github/copilot-instructions.md`](DnD-Beyond-pdf-parser/.github/copilot-instructions.md#L1-L200) for targeted guidance on code patterns, field IDs, and response shape.
- Preserve current JSON shapes and HTTP status behaviors when extending the API to avoid breaking downstream users.

If you want, I can:
- extract parsing logic to `src/parsers.js` with tests, or
- add a small example script that downloads and parses a PDF from `input_pdfs/`.
