#!/usr/bin/env node
/**
 * D&D Character JSON to Neo4j Cypher converter
 * Usage: node scripts/json_to_cypher.js <path-to-json-file>
 * Output: Cypher CREATE statements ready to paste into Neo4j Browser
 */

import fs from 'fs';
import path from 'path';

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

  // 1. CREATE Character node
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

  // 2. CREATE Appearance node
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

  // 3. CREATE Traits node
  cypher += `// Create Traits node\n`;
  cypher += `CREATE (traits:Traits {\n`;
  cypher += `  personalityTraits: ${escapeCypherString(traits.personalityTraits)},\n`;
  cypher += `  ideals: ${escapeCypherString(traits.ideals)},\n`;
  cypher += `  bonds: ${escapeCypherString(traits.bonds)},\n`;
  cypher += `  flaws: ${escapeCypherString(traits.flaws)}\n`;
  cypher += `})\n`;
  cypher += `CREATE (char)-[:HAS_TRAITS]->(traits)\n`;
  cypher += `WITH char\n\n`;

  // 4. CREATE Attributes using UNWIND
  cypher += `// Create Attribute nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(attributes)} AS attr\n`;
  cypher += `CREATE (attribute:Attribute {name: attr.name, value: attr.roll})\n`;
  cypher += `CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)\n`;
  cypher += `WITH char\n\n`;

  // 5. CREATE Ability Checks using UNWIND
  cypher += `// Create AbilityCheck nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(abilityChecks)} AS check\n`;
  cypher += `CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})\n`;
  cypher += `CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)\n`;
  cypher += `WITH char\n\n`;

  // 6. CREATE Saving Throws using UNWIND
  cypher += `// Create Save nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(saves)} AS save\n`;
  cypher += `CREATE (savingThrow:Save {name: save.name, bonus: save.roll})\n`;
  cypher += `CREATE (char)-[:HAS_SAVE]->(savingThrow)\n`;
  cypher += `WITH char\n\n`;

  // 7. CREATE Attacks using UNWIND
  cypher += `// Create Attack nodes\n`;
  cypher += `UNWIND ${formatUnwindArray(attacks)} AS attack\n`;
  cypher += `CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})\n`;
  cypher += `CREATE (char)-[:HAS_ATTACK]->(attackNode)\n\n`;

  return cypher;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node json_to_cypher.js <path-to-json-file>');
    console.error('Example: node json_to_cypher.js output_json/Big\\ Lou\\ -\\ Character\\ Sheet\\ v1.json');
    process.exit(1);
  }

  const jsonFile = args[0];

  try {
    const data = fs.readFileSync(jsonFile, 'utf8');
    const character = JSON.parse(data);

    const cypher = generateCharacterCypher(character);

    // Output Cypher to stdout
    console.log(cypher);
    console.log('// Paste the above into Neo4j Browser to create the character graph');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`File not found: ${jsonFile}`);
    } else if (err instanceof SyntaxError) {
      console.error(`Invalid JSON in ${jsonFile}: ${err.message}`);
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(1);
  }
}

main();
