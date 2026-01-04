#!/usr/bin/env node
/**
 * Batch convert all JSON files to Cypher
 * Usage: node scripts/cypher_batch.js
 * Reads all JSON from output_json/ and writes Cypher to output_cypher/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeCypherString(str) {
  if (str === null || str === undefined) return 'null';
  return '"' + String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

function formatUnwindArray(items) {
  if (!items || items.length === 0) return '[]';
  const formatted = items.map(item => {
    const pairs = Object.entries(item)
      .map(([k, v]) => {
        const val = typeof v === 'string' ? escapeCypherString(v) : v;
        return `${k}:${val}`;
      })
      .join(', ');
    return `{${pairs}}`;
  }).join(',\n  ');
  return `[\n  ${formatted}\n]`;
}

function generateCharacterCypher(character) {
  const {
    characterName,
    classLevel,
    race,
    background,
    ac,
    maxHP,
    profBonus,
    initiative,
    passivePerception,
    passiveInsight,
    passiveInvestigation,
    appearance,
    traits,
    attacks,
    abilityChecks,
    attributes,
    saves
  } = character;

  let cypher = '';

  cypher += `// Create Character node\n`;
  cypher += `CREATE (char:Character {\n`;
  cypher += `  name: ${escapeCypherString(characterName)},\n`;
  cypher += `  classLevel: ${escapeCypherString(classLevel)},\n`;
  cypher += `  race: ${escapeCypherString(race)},\n`;
  cypher += `  background: ${escapeCypherString(background)},\n`;
  cypher += `  ac: ${ac},\n`;
  cypher += `  maxHP: ${maxHP},\n`;
  cypher += `  profBonus: ${profBonus},\n`;
  cypher += `  initiative: ${initiative},\n`;
  cypher += `  passivePerception: ${passivePerception},\n`;
  cypher += `  passiveInsight: ${passiveInsight},\n`;
  cypher += `  passiveInvestigation: ${passiveInvestigation}\n`;
  cypher += `})\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create Appearance node\n`;
  cypher += `CREATE (appearance:Appearance {\n`;
  cypher += `  gender: ${escapeCypherString(appearance.gender)},\n`;
  cypher += `  age: ${escapeCypherString(appearance.age)},\n`;
  cypher += `  height: ${escapeCypherString(appearance.height)},\n`;
  cypher += `  weight: ${escapeCypherString(appearance.weight)},\n`;
  cypher += `  alignment: ${escapeCypherString(appearance.alignment)},\n`;
  cypher += `  faith: ${escapeCypherString(appearance.faith)},\n`;
  cypher += `  skin: ${escapeCypherString(appearance.skin)},\n`;
  cypher += `  eyes: ${escapeCypherString(appearance.eyes)},\n`;
  cypher += `  hair: ${escapeCypherString(appearance.hair)}\n`;
  cypher += `})\n`;
  cypher += `CREATE (char)-[:HAS_APPEARANCE]->(appearance)\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create Traits node\n`;
  cypher += `CREATE (traits:Traits {\n`;
  cypher += `  personalityTraits: ${escapeCypherString(traits.personalityTraits)},\n`;
  cypher += `  ideals: ${escapeCypherString(traits.ideals)},\n`;
  cypher += `  bonds: ${escapeCypherString(traits.bonds)},\n`;
  cypher += `  flaws: ${escapeCypherString(traits.flaws)}\n`;
  cypher += `})\n`;
  cypher += `CREATE (char)-[:HAS_TRAITS]->(traits)\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create Attribute nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(attributes)} AS attr\n`;
  cypher += `CREATE (attribute:Attribute {name: attr.name, value: attr.roll})\n`;
  cypher += `CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create AbilityCheck nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(abilityChecks)} AS check\n`;
  cypher += `CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})\n`;
  cypher += `CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create Save nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(saves)} AS save\n`;
  cypher += `CREATE (savingThrow:Save {name: save.name, bonus: save.roll})\n`;
  cypher += `CREATE (char)-[:HAS_SAVE]->(savingThrow)\n`;
  cypher += `WITH char\n\n`;

  cypher += `// Create Attack nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(attacks)} AS attack\n`;
  cypher += `CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})\n`;
  cypher += `CREATE (char)-[:HAS_ATTACK]->(attackNode)\n\n`;

  return cypher;
}

async function main() {
  const cwd = process.cwd();
  const inputDir = path.join(cwd, 'output_json');
  const outputDir = path.join(cwd, 'output_cypher');

  await fs.promises.mkdir(outputDir, { recursive: true });

  let files;
  try {
    files = await fs.promises.readdir(inputDir);
  } catch (err) {
    console.error(`Could not read input directory ${inputDir}:`, err.message);
    process.exit(1);
  }

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.json')) continue;
    const inPath = path.join(inputDir, file);
    const base = path.parse(file).name;
    const outPath = path.join(outputDir, `${base}.cypher`);

    try {
      const data = await fs.promises.readFile(inPath, 'utf8');
      const character = JSON.parse(data);
      const cypher = generateCharacterCypher(character);
      await fs.promises.writeFile(outPath, cypher, 'utf8');
      console.log(`Wrote ${outPath}`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message || err);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
