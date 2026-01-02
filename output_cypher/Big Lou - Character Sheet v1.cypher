// Create Character node
CREATE (char:Character {
  name: "Big Lou",
  classLevel: "Fighter 4",
  race: "Goliath",
  background: "Guard",
  ac: 12,
  maxHP: 40,
  profBonus: 2,
  initiative: 2,
  passivePerception: 13,
  passiveInsight: 13,
  passiveInvestigation: 12
})
WITH char

// Create Appearance node
CREATE (appearance:Appearance {
  gender: "Male",
  age: "29",
  height: "7'6\"",
  weight: "410",
  alignment: "Lawful Neutral",
  faith: "Code of the Street",
  skin: "Grey w/ blue tattoos",
  eyes: "Ice Blue",
  hair: "Bald"
})
CREATE (char)-[:HAS_APPEARANCE]->(appearance)
WITH char

// Create Traits node
CREATE (traits:Traits {
  personalityTraits: "Wisecracker: Lou’s humor is legendary, always ready with a salty observation or double entendre that dances up to the edge of vulgarity without ever crossing it. \nShrewd: Smarter and more perceptive than most expect, Lou reads people and situations quickly, rarely missing a trick or deception. \nLoyal to a Fault: His devotion to Petra, the theater, and his crew is absolute; he’ll risk anything for those he calls his own. \nApproachable: Despite his bulk and reputation, Lou is beloved by working folk and regulars, always willing to listen or lend advice—often with a joke. \nProfessional: He takes pride in his appearance, his skills, and the order he maintains, holding himself to high standards of conduct and taste.",
  ideals: "Protection: Believes his strength and smarts exist to safeguard those who cannot defend themselves. \nLoyalty: Holds deep, unshakeable bonds with Petra, his crew, and the Triskelion. \nShrewdness: Values cleverness and experience as much as brute force, always thinking ahead. \nJustice: Stands up to bullies, cheats, and those who would harm the innocent or the vulnerable. \nCommunity: Sees himself as part of the city’s fabric, responsible for its well-being—especially the working class.",
  bonds: "Petra Foxglove: His boss, confidant, and the person he’d do anything to protect. \nThe Triskelion: More than just a job, the theater is Lou’s home and family. \nThe Working Class: Lou feels kinship with laborers, performers, and regular folk—respected and trusted by them. \nSecurity Crew: Leads a loyal team of big men and clever scouts, handpicked for skill and trustworthiness. \nOld Acquaintances: Knows most innkeepers, tradesmen, and adventurers in the city—many owe him favors or trust his judgment.",
  flaws: "Overprotective: Sometimes steps in too soon or too forcefully, not trusting others to handle danger. \nBlunt: His straightforward manner and salty humor can ruffle feathers or offend the overly sensitive. \nVices: Rarely without a cigar, enjoys the finer things—sometimes to excess. \nHolds Grudges: Especially against the corrupt or treacherous, like Harlow Fignolls or suspected cultists. \nReluctant to Back Down: Hates retreating or admitting he’s wrong, sometimes escalating situations unnecessarily."
})
CREATE (char)-[:HAS_TRAITS]->(traits)
WITH char

// Create Attribute nodes
UNWIND [{"name":"Strength","roll":19},{"name":"Dexterity","roll":10},{"name":"Constitution","roll":17},{"name":"Intelligence","roll":14},{"name":"Wisdom","roll":12},{"name":"Charisma","roll":12}] AS attr
CREATE (attribute:Attribute {name: attr.name, value: attr.roll})
CREATE (char)-[:HAS_ATTRIBUTE]->(attribute)
WITH char

// Create AbilityCheck nodes
UNWIND [{"name":"Initiative","roll":2},{"name":"Acrobatics","roll":0},{"name":"Animal Handling","roll":1},{"name":"Arcana","roll":2},{"name":"Athletics","roll":6},{"name":"Deception","roll":1},{"name":"History","roll":2},{"name":"Insight","roll":3},{"name":"Intimidation","roll":3},{"name":"Investigation","roll":2},{"name":"Medicine","roll":1},{"name":"Nature","roll":2},{"name":"Perception","roll":3},{"name":"Performance","roll":1},{"name":"Persuasion","roll":3},{"name":"Religion","roll":2},{"name":"Sleight of Hand","roll":0},{"name":"Stealth","roll":0},{"name":"Survival","roll":1}] AS check
CREATE (abilityCheck:AbilityCheck {name: check.name, bonus: check.roll})
CREATE (char)-[:HAS_ABILITY_CHECK]->(abilityCheck)
WITH char

// Create Save nodes
UNWIND [{"name":"Strength Save","roll":6},{"name":"Dexterity Save","roll":0},{"name":"Constitution Save","roll":5},{"name":"Intelligence Save","roll":2},{"name":"Wisdom Save","roll":1},{"name":"Charisma Save","roll":1}] AS save
CREATE (savingThrow:Save {name: save.name, bonus: save.roll})
CREATE (char)-[:HAS_SAVE]->(savingThrow)
WITH char

// Create Attack nodes
UNWIND [{"name":"Unarmed Strike","roll":6,"damage":"1d6+4"},{"name":"Tavern Brawler Strike","roll":6,"damage":"1d6+4"}] AS attack
CREATE (attackNode:Attack {name: attack.name, toHit: attack.roll, damage: attack.damage})
CREATE (char)-[:HAS_ATTACK]->(attackNode)

