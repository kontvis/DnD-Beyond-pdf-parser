# Release Notes — v1.1

Release date: 2026-01-01

Summary
- Extended parser to extract additional character sheet fields. This release expands the API response to include core D&D character attributes (class/level, race, background, AC, HP, proficiency bonus, initiative, and passive skill checks).

New fields extracted
- `classLevel` — Class and character level (e.g., "Fighter 4")
- `race` — Character species/race (e.g., "Goliath")
- `background` — Character background (e.g., "Guard")
- `ac` — Armor Class (integer)
- `maxHP` — Maximum hit points (integer)
- `profBonus` — Proficiency bonus (integer)
- `initiative` — Initiative modifier (integer)
- `passivePerception` — Passive Perception check (10 + Perception modifier)
- `passiveInsight` — Passive Insight check (10 + Insight modifier)
- `passiveInvestigation` — Passive Investigation check (10 + Investigation modifier)

Changes from v1.0
- Refactored: moved all parsing logic from `src/index.js` into reusable `src/parser.js` module
- API response now includes the new fields listed above
- `src/index.js` simplified — now uses `parsePdfBuffer()` from `src/parser.js`
- Both batch CLI (`yarn parse:folder`) and HTTP API use the same parser, ensuring consistency

Example new response shape
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
  "attacks": [...],
  "abilityChecks": [...],
  "attributes": [...],
  "saves": [...]
}
```

Developer notes
- Added `scripts/explore_pdf.js` for field discovery (run `node scripts/explore_pdf.js` to inspect all available fields in a PDF).
- Field IDs found: `CLASS_LEVEL`, `RACE`, `BACKGROUND`, `AC`, `MaxHP`, `ProfBonus`, `Init`, `Passive1` (Perception), `Passive2` (Insight), `Passive3` (Investigation).

Backward compatibility
- The API response now includes additional fields. Downstream consumers expecting v1.0 response should handle or ignore the new fields gracefully.

Suggested next steps (future releases)
- Extract additional fields: defenses (resistances, immunities, vulnerabilities), languages, tool proficiencies, features & traits text.
- Add unit tests for `src/parser.js`.
- Add CLI flag `--file <name>` to parse a single PDF instead of the entire folder.
- Add structured error responses (JSON) instead of plain text.
