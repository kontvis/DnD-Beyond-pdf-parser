# dnd-beyond-pdf-parser

This project transforms a collection of Dungeons & Dragons characters—originally created and managed in D&D Beyond—into a richly connected graph database. Each character includes detailed attributes, abilities, relationships, factions, and narrative ties, all of which are modeled as nodes and relationships in Neo4j. The goal is to visualize the entire cast as an interconnected network, making it easy to explore how characters relate to one another, uncover hidden patterns, and support worldbuilding through a dynamic, queryable graph structure. This approach turns traditional character sheets into a living data model that grows alongside the story.

Small Node.js service that downloads D&D Beyond character PDFs, parses them with `pdf2json`, and exposes extracted rolls and stats via a simple HTTP API.  Then converts the JSON to Cypher for insertion in a Graph DB. 

**Entrypoint:** [DnD-Beyond-pdf-parser/src/index.js](DnD-Beyond-pdf-parser/src/index.js#L1-L400)

Quick start

First time setup:

```bash
./setup.sh
```

Then run the server:

```bash
yarn start    # runs node . (listens on port 8080)
# or for live reload:
yarn watch
```

Build (Docker)

```bash
yarn build    # runs docker build using the repo dockerfile
```

API

- GET `/rolls?characterId=<id>&source=<source>`
  - `characterId` (required): Character ID for lookup.
  - `source` (optional, default `download`): Where to fetch the PDF from.
    - `download`: Fetch from `https://www.dndbeyond.com/sheet-pdfs/<id>.pdf`.
    - `local`: Load from `input_pdfs/<id>.pdf` (for manually downloaded PDFs).
  - Error codes: missing `characterId` → 400, PDF not found (local) → 400, fetch failure (download) → 400, parse failure → 500.

Example

```bash
# Download from D&D Beyond:
curl "http://localhost:8080/rolls?characterId=123456&source=download"

# Parse local PDF (from input_pdfs/):
curl "http://localhost:8080/rolls?characterId=123456&source=local"

# Default is download (same as above):
curl "http://localhost:8080/rolls?characterId=123456"
```

Example response shape

```json
{
  "characterName": "Big Lou",
  "classLevel": "Fighter 4",
  "race": "Goliath",
  "background": "Guard",
  "ac": 12,
  "maxHP": 40,
  "profBonus": 2,
  "initiative": 2,
  "passivePerception": 13,
  "passiveInsight": 13,
  "passiveInvestigation": 12,
  "appearance": {
    "gender": "Male",
    "age": "29",
    "height": "7'6\"",
    "weight": "410",
    "alignment": "Lawful Neutral",
    "faith": "Code of the Street",
    "skin": "Grey w/ blue tattoos",
    "eyes": "Ice Blue",
    "hair": "Bald"
  },
  "traits": {
    "personalityTraits": "Wisecracker: Lou's humor is legendary...",
    "ideals": "Protection: Believes his strength and smarts...",
    "bonds": "Petra Foxglove: His boss, confidant...",
    "flaws": "Overprotective: Sometimes steps in too soon..."
  },
  "attacks": [{ "name": "Unarmed Strike", "roll": 6, "damage": "1d6+4" }],
  "abilityChecks": [{ "name": "Initiative", "roll": 2 }],
  "attributes": [{ "name": "Strength", "roll": 19 }],
  "saves": [{ "name": "Strength Save", "roll": 6 }]
}
```

Development notes

- The parser relies on `pdf2json` events (`pdfParser_dataReady`) and uses the `Fields[].id.Id` and `Fields[].V` convention. See helper functions in [src/index.js](DnD-Beyond-pdf-parser/src/index.js#L1-L400) (`findValue`, `getValueList`, `findPage`).
- Linting: `yarn lint` / `yarn lint:fix` (ESLint configured for `src`). See [package.json](DnD-Beyond-pdf-parser/package.json#L1-L200).
- Keep parsing logic small and colocated with the handlers; if it grows, add a new module under `src/` and import it from `index.js`.

Batch parsing (local files)

- Use the bundled script to parse all PDFs in `input_pdfs/` and write JSON outputs to `output_json/`.
- Command:

```bash
yarn parse:folder
```

- Output files are written as `output_json/<pdf-basename>.json` (same basename as each PDF).
- Example quick checks:

```bash
ls -la output_json/
cat "output_json/Big Lou - Character Sheet v1.json" | jq .
```

Dependencies

- Runtime: `axios`, `express`, `pdf2json` (declared in [package.json](DnD-Beyond-pdf-parser/package.json#L1-L200)).

Notes for AI contributors

- See [`.github/copilot-instructions.md`](DnD-Beyond-pdf-parser/.github/copilot-instructions.md#L1-L200) for targeted guidance on code patterns, field IDs, and response shape.
- Preserve current JSON shapes and HTTP status behaviors when extending the API to avoid breaking downstream users.

If you want, I can:
- extract parsing logic to `src/parsers.js` with tests, or
- add a small example script that downloads and parses a PDF from `input_pdfs/`.
