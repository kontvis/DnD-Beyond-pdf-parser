// Create Character node
CREATE (char:Character {
  name: "Fezic Fourfingers",
  classLevel: "Ranger 4",
  race: "Goblin",
  background: "Guild Artisan / Guild Merchant",
  ac: 16,
  maxHP: 36,
  profBonus: 2,
  initiative: 6,
  passivePerception: 14,
  passiveInsight: 16,
  passiveInvestigation: 10
})
WITH char

// Create Appearance node
CREATE (appearance:Appearance {
  gender: "Male",
  age: "50",
  height: "3' 6\"",
  weight: "45",
  alignment: "Chaotic Neutral",
  faith: "Dugmaren Brightmantle",
  skin: "Olive green",
  eyes: "Red",
  hair: "Silver"
})
CREATE (char)-[:HAS_APPEARANCE]->(appearance)
WITH char

// Create Traits node
CREATE (traits:Traits {
  personalityTraits: "Crotchety & Cantankerous: Fezic is a classic curmudgeon—hard of hearing, quick to complain, and always convinced others are speaking gibberish or asking for the impossible. \nWise Observer: His poor hearing means he spends a lot of time silently watching, catching details others miss, and making shrewd inferences. \nAnimal Whisperer: He’s a natural with animals, talking to them as if they understand every word (and as if he can “hear” their thoughts in return). \nInventive but Absentminded: Always cobbling together props and gadgets, but often misplaces things or botches instructions (to comic effect). \nResilient: Used to pain and mishaps, he shrugs off injuries with a story about his glory days or a rant about his latest malady. \nWell-Connected: Knows the ins and outs of markets (even the shady ones) and can always “find a guy”",
  ideals: "Ingenuity: Believes every problem can be fixed with a little creativity (and maybe some duct tape). \nLoyalty: Fiercely loyal to Ethyl, the cast, crew, and especially his animals. \nWisdom: Values common sense and lived experience over book learning or fancy talk. \nResilience: Takes pride in surviving, adapting, and being indispensable. \nResourcefulness: There’s always another way, another tool, or another critter to help.",
  bonds: "Ethyl Ironspine: His boss and the only one he (grudgingly) accepts orders from. \nPindlewick: His wizardly partner in lighting and effects, and theatrical chaos—a classic “odd couple.” \nHis Animals: Treats his animal helpers as family, confiding in them and relying on them for all manner of tasks. \nThe Cast & Crew: Respected (if grumbled about) for his reliability and talent, even if he’s a headache to work with. \nMarket Contacts: Maintains a web of contacts in every market—legal or otherwise—across the city.",
  flaws: "Hard of Hearing: Misunderstands instructions, gets frustrated, and often yells when confused. \nCantankerous: Quick to complain, slow to trust, and always ready with an insult or a groan. \nInjury-Prone: Always getting banged up or ill, and always talking about it. \nDistracted: Forgets what he’s doing, especially when animals or gadgets are involved. \nGrumpy: Can be difficult to like or work with, but his value to the theater is never in question."
})
CREATE (char)-[:HAS_TRAITS]->(traits)
WITH char

// Create Attribute nodes
UNWIND [
  {name:"Strength", roll:9},
  {name:"Dexterity", roll:18},
  {name:"Constitution", roll:14},
  {name:"Intelligence", roll:10},
  {name:"Wisdom", roll:18},
  {name:"Charisma", roll:8}
] AS attr
CREATE (attribute:Attribute {name: attr.name, value: attr.roll})
CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)
WITH char

// Create AbilityCheck nodes
UNWIND [
  {name:"Initiative", roll:6},
  {name:"Acrobatics", roll:4},
  {name:"Animal Handling", roll:8},
  {name:"Arcana", roll:0},
  {name:"Athletics", roll:1},
  {name:"Deception", roll:-1},
  {name:"History", roll:0},
  {name:"Insight", roll:6},
  {name:"Intimidation", roll:-1},
  {name:"Investigation", roll:0},
  {name:"Medicine", roll:4},
  {name:"Nature", roll:0},
  {name:"Perception", roll:4},
  {name:"Performance", roll:-1},
  {name:"Persuasion", roll:1},
  {name:"Religion", roll:0},
  {name:"Sleight of Hand", roll:4},
  {name:"Stealth", roll:4},
  {name:"Survival", roll:6}
] AS check
CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})
CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)
WITH char

// Create Save nodes
UNWIND [
  {name:"Strength Save", roll:1},
  {name:"Dexterity Save", roll:6},
  {name:"Constitution Save", roll:2},
  {name:"Intelligence Save", roll:0},
  {name:"Wisdom Save", roll:4},
  {name:"Charisma Save", roll:-1}
] AS save
CREATE (savingThrow:Save {name: save.name, bonus: save.roll})
CREATE (char)-[:HAS_SAVE]->(savingThrow)
WITH char

// Create Attack nodes
UNWIND [
  {name:"Unarmed Strike", roll:1},
  {name:"Enhanced Unarmed Strike", roll:1, damage:"1d4-1"},
  {name:"Spell Attack", roll:6}
] AS attack
CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})
CREATE (char)-[:HAS_ATTACK]->(attackNode)

