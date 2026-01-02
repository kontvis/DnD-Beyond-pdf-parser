// Create Character node
CREATE (char:Character {
  name: "Lady Celeste Silverthrush",
  classLevel: "Bard 2 / Wizard 2",
  race: "Human",
  background: "Noble",
  ac: 11,
  maxHP: 21,
  profBonus: 2,
  initiative: 1,
  passivePerception: 11,
  passiveInsight: 11,
  passiveInvestigation: 16
})
WITH char

// Create Appearance node
CREATE (appearance:Appearance {
  gender: "Female",
  age: "31",
  height: "5' 7\"",
  weight: "125",
  alignment: "Lawful Good",
  faith: "Waukeen",
  skin: "Fair",
  eyes: "Blue",
  hair: "Blonde"
})
CREATE (char)-[:HAS_APPEARANCE]->(appearance)
WITH char

// Create Traits node
CREATE (traits:Traits {
  personalityTraits: "Idealistic & Innocent: Celeste believes the best of everyone and every project, embracing social causes and trends with wide-eyed enthusiasm. \nNaive & Trusting: Raised among tutors and in finishing schools, she takes people at their word, often to a fault. \nEasily Fascinated: She is captivated by novelty, new ideas, and the latest fads—from fashion to philosophy. \nRomantic & Supportive: Dotes on Everett (whom she considers a",
  ideals: "Art as Uplift:€Celeste sees the theater as a vehicle for civic pride and emotional healing, believing that beauty and creativity are essential to a thriving city. \nNoblesse Oblige:€She feels a deep responsibility to use her privilege for the benefit of others, especially struggling artists and staff. \nInnovation:€Always seeking the newest artistic expression, she encourages experimentation and boldness in performances and stagecraft. \nGenerosity:€Celeste is quick to give time, resources, and emotional support, often to a fault.",
  bonds: "Family Legacy: Celeste is deeply loyal to her family and its reputation, striving to honor the Silverthrush name through patronage and public service.** \nEverett: She regards Everett as a misunderstood prodigy, determined to see him succeed and shield him from criticism. \nLionel: Her innocent affection for Lionel colors her interactions; she admires his strength and integrity, though he remains oblivious. \nTheater: The Triskelion is her home and passion; she would sacrifice much to preserve it. \nBaroness: She regularly negotiates with the Baroness, balancing the interests of nobility and the arts. \nDistrust of Harlow Fignolls: She is vigilant against his political scheming, ever on guard for the theater’s independence.",
  flaws: "Naivete:€Celeste is sometimes gullible, too trusting of new acquaintances and new ideas. \nUnrealistic Expectations:€Her sheltered upbringing leads her to expect perfection and harmony, resulting in frequent disappointment. \nEasily Distracted:€Her enthusiasm for novelty and trends can cause her to abandon projects before completion. \nStage Fright:€Despite her love for theater, she suffers from severe performance anxiety, rarely appearing on stage herself. \nSheltered:€She lacks practical experience, sometimes misjudging the complexities of creative and business ventures."
})
CREATE (char)-[:HAS_TRAITS]->(traits)
WITH char

// Create Attribute nodes
UNWIND [{"name":"Strength","roll":10},{"name":"Dexterity","roll":12},{"name":"Constitution","roll":10},{"name":"Intelligence","roll":18},{"name":"Wisdom","roll":10},{"name":"Charisma","roll":20}] AS attr
CREATE (attribute:Attribute {name: attr.name, value: attr.roll})
CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)
WITH char

// Create AbilityCheck nodes
UNWIND [{"name":"Initiative","roll":1},{"name":"Acrobatics","roll":2},{"name":"Animal Handling","roll":1},{"name":"Arcana","roll":6},{"name":"Athletics","roll":1},{"name":"Deception","roll":6},{"name":"History","roll":8},{"name":"Insight","roll":1},{"name":"Intimidation","roll":6},{"name":"Investigation","roll":6},{"name":"Medicine","roll":1},{"name":"Nature","roll":6},{"name":"Perception","roll":1},{"name":"Performance","roll":7},{"name":"Persuasion","roll":9},{"name":"Religion","roll":6},{"name":"Sleight of Hand","roll":3},{"name":"Stealth","roll":2},{"name":"Survival","roll":1}] AS check
CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})
CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)
WITH char

// Create Save nodes
UNWIND [{"name":"Strength Save","roll":0},{"name":"Dexterity Save","roll":3},{"name":"Constitution Save","roll":0},{"name":"Intelligence Save","roll":4},{"name":"Wisdom Save","roll":0},{"name":"Charisma Save","roll":7}] AS save
CREATE (savingThrow:Save {name: save.name, bonus: save.roll})
CREATE (char)-[:HAS_SAVE]->(savingThrow)
WITH char

// Create Attack nodes
UNWIND [{"name":"Unarmed Strike","roll":2},{"name":"Spell Attack","roll":7}] AS attack
CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})
CREATE (char)-[:HAS_ATTACK]->(attackNode)

