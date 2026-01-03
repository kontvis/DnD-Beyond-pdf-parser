// Create Character node
CREATE (char:Character {
  name: "Oskar",
  classLevel: "Barbarian 4",
  race: "Half-Orc",
  background: "Artisan",
  ac: 16,
  maxHP: 45,
  profBonus: 2,
  initiative: 3,
  passivePerception: 10,
  passiveInsight: 10,
  passiveInvestigation: 11
})
WITH char

// Create Appearance node
CREATE (appearance:Appearance {
  gender: "Male",
  age: "32",
  height: "6' 3\"",
  weight: "245",
  alignment: "Neutral",
  faith: null,
  skin: "Paint-spattered, olive green",
  eyes: "Green",
  hair: "Black"
})
CREATE (char)-[:HAS_APPEARANCE]->(appearance)
WITH char

// Create Traits node
CREATE (traits:Traits {
  personalityTraits: "Laid-Back: Oskar rarely gets flustered. He moves at his own pace, unhurried by deadlines or disasters, and tends to shrug off chaos with a grin and a half-hearted joke. \nCreative (and Chaotic): He approaches set design like a mad inventor, improvising solutions, combining odd materials, and often breaking the rules of carpentry, physics, and good taste. \nDutiful (When Reminded): Though distractible and a bit lazy, Oskar is loyal to Ethyl and will buckle down when she (or Petra) really needs him. \nMessy: Leaves tools, scraps, and snack wrappers everywhere; his workspace is a minefield of creative clutter. \nCheerful: Maintains a positive attitude, chuckling through setbacks and finding humor in both triumph and disaster.",
  ideals: "Creativity: Believes there’s no problem that can’t be solved with a little ingenuity and a lot of duct tape. \nLoyalty: Devoted to Ethyl, Mother, and the theater—he’d never abandon them, no matter how messy things get. \nFreedom: Resists rigid schedules and prefers working on his own terms. \nCollaboration: Enjoys working with others (especially Mother), finding magic in teamwork, however chaotic. \nResilience: Takes pride in making things work with whatever’s available, never letting lack of resources stop him.",
  bonds: "Ethyl Ironspine: His supervisor, inspiration, and the only one who can truly motivate him. \nMother (the Triskelion Stage): Oskar’s closest companion and creative partner; he maintains",
  flaws: "Sloppy: His work and living space are always a mess, sometimes causing accidents or delays. \nDistractible: Easily sidetracked by new ideas, snacks, or interesting noises from Mother. \nProcrastinator: Puts off jobs he finds boring or repetitive, often finishing things at the last minute. \nLazy Streak: Needs a push to get started on tough jobs, especially if Ethyl isn't watching. \nUnderestimates Danger: Sometimes too trusting of Mother’s magic, leading to unpredictable or hazardous sets."
})
CREATE (char)-[:HAS_TRAITS]->(traits)
WITH char

// Create Attribute nodes
UNWIND [
  {name:"Strength", roll:20},
  {name:"Dexterity", roll:16},
  {name:"Constitution", roll:16},
  {name:"Intelligence", roll:9},
  {name:"Wisdom", roll:10},
  {name:"Charisma", roll:11}
] AS attr
CREATE (attribute:Attribute {name: attr.name, value: attr.roll})
CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)
WITH char

// Create AbilityCheck nodes
UNWIND [
  {name:"Initiative", roll:3},
  {name:"Acrobatics", roll:3},
  {name:"Animal Handling", roll:2},
  {name:"Arcana", roll:-1},
  {name:"Athletics", roll:7},
  {name:"Deception", roll:0},
  {name:"History", roll:-1},
  {name:"Insight", roll:0},
  {name:"Intimidation", roll:2},
  {name:"Investigation", roll:1},
  {name:"Medicine", roll:0},
  {name:"Nature", roll:-1},
  {name:"Perception", roll:0},
  {name:"Performance", roll:0},
  {name:"Persuasion", roll:2},
  {name:"Religion", roll:-1},
  {name:"Sleight of Hand", roll:3},
  {name:"Stealth", roll:3},
  {name:"Survival", roll:2}
] AS check
CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})
CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)
WITH char

// Create Save nodes
UNWIND [
  {name:"Strength Save", roll:7},
  {name:"Dexterity Save", roll:3},
  {name:"Constitution Save", roll:5},
  {name:"Intelligence Save", roll:-1},
  {name:"Wisdom Save", roll:0},
  {name:"Charisma Save", roll:0}
] AS save
CREATE (savingThrow:Save {name: save.name, bonus: save.roll})
CREATE (char)-[:HAS_SAVE]->(savingThrow)
WITH char

// Create Attack nodes
UNWIND [
  {name:"Unarmed Strike", roll:7}
] AS attack
CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})
CREATE (char)-[:HAS_ATTACK]->(attackNode)

