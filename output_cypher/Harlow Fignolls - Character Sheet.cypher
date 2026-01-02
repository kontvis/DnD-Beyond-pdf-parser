// Create Character node
CREATE (char:Character {
  name: "Harlow Fignolls",
  classLevel: "Bard 3 / Rogue 7",
  race: "Dwarf",
  background: "Merchant",
  ac: 12,
  maxHP: 83,
  profBonus: 4,
  initiative: 2,
  passivePerception: 14,
  passiveInsight: 20,
  passiveInvestigation: 18
})
WITH char

// Create Appearance node
CREATE (appearance:Appearance {
  gender: null,
  age: null,
  height: null,
  weight: null,
  alignment: null,
  faith: null,
  skin: null,
  eyes: null,
  hair: null
})
CREATE (char)-[:HAS_APPEARANCE]->(appearance)
WITH char

// Create Traits node
CREATE (traits:Traits {
  personalityTraits: null,
  ideals: null,
  bonds: null,
  flaws: null
})
CREATE (char)-[:HAS_TRAITS]->(traits)
WITH char

// Create Attribute nodes
UNWIND [{"name":"Strength","roll":10},{"name":"Dexterity","roll":14},{"name":"Constitution","roll":14},{"name":"Intelligence","roll":19},{"name":"Wisdom","roll":14},{"name":"Charisma","roll":17}] AS attr
CREATE (attribute:Attribute {name: attr.name, value: attr.roll})
CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)
WITH char

// Create AbilityCheck nodes
UNWIND [{"name":"Initiative","roll":2},{"name":"Acrobatics","roll":4},{"name":"Animal Handling","roll":10},{"name":"Arcana","roll":6},{"name":"Athletics","roll":2},{"name":"Deception","roll":11},{"name":"History","roll":6},{"name":"Insight","roll":10},{"name":"Intimidation","roll":11},{"name":"Investigation","roll":8},{"name":"Medicine","roll":4},{"name":"Nature","roll":6},{"name":"Perception","roll":4},{"name":"Performance","roll":5},{"name":"Persuasion","roll":11},{"name":"Religion","roll":6},{"name":"Sleight of Hand","roll":4},{"name":"Stealth","roll":4},{"name":"Survival","roll":4}] AS check
CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})
CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)
WITH char

// Create Save nodes
UNWIND [{"name":"Strength Save","roll":0},{"name":"Dexterity Save","roll":6},{"name":"Constitution Save","roll":2},{"name":"Intelligence Save","roll":4},{"name":"Wisdom Save","roll":2},{"name":"Charisma Save","roll":7}] AS save
CREATE (savingThrow:Save {name: save.name, bonus: save.roll})
CREATE (char)-[:HAS_SAVE]->(savingThrow)
WITH char

// Create Attack nodes
UNWIND [{"name":"Unarmed Strike","roll":4},{"name":"Spell Attack","roll":7}] AS attack
CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})
CREATE (char)-[:HAS_ATTACK]->(attackNode)

