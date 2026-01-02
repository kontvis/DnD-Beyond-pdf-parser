# Release Notes — v1.2

Release date: 2026-01-01

Summary
- Extended parser to extract character appearance and personality trait fields from the character sheet PDF. This release adds 14 new fields covering physical description, personality, ideals, bonds, flaws, and character motivations.

New fields extracted
Appearance (from `appearance` object):
- `gender` — Character gender
- `age` — Character age
- `height` — Character height
- `weight` — Character weight
- `alignment` — Alignment (e.g., "Lawful Neutral")
- `faith` — Faith or philosophy (e.g., "Code of the Street")
- `skin` — Skin color/appearance
- `eyes` — Eye color
- `hair` — Hair color/style

Traits (from `traits` object):
- `personalityTraits` — Text describing personality traits
- `ideals` — Text describing character ideals
- `bonds` — Text describing important bonds and relationships
- `flaws` — Text describing character flaws and vices

Changes from v1.1
- Updated `src/parser.js` to read from page 4 (Features & Traits sheet) and extract appearance and trait fields
- Response now includes top-level `appearance` and `traits` objects grouping the new fields
- All PDFs re-parsed with the new fields

Example new response structure
```json
{
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
  }
}
```

Developer notes
- Page 4 field IDs: `GENDER`, `AGE`, `HEIGHT`, `WEIGHT`, `ALIGNMENT`, `FAITH`, `SKIN`, `EYES`, `HAIR`, `PersonalityTraits_`, `Ideals`, `Bonds`, `Flaws`.
- Trait fields are text blobs (multi-line descriptions); no parsing of individual items within these fields is performed.
- Falls back gracefully if page 4 is missing (uses page 1 instead).

Backward compatibility
- Response structure now includes `appearance` and `traits` as nested objects. Downstream consumers expecting v1.1 response should update to handle the new structure.

Suggested next steps (future releases)
- Extract features & abilities text from pages 2–3.
- Add CLI option to export specific fields (e.g., `--fields appearance.gender,appearance.age`).
- Add support for parsing spell lists and spell save DCs.
- Consider parsing trait descriptions into individual items (split by newline or pattern).
