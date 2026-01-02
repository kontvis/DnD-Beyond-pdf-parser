import PDFParser from 'pdf2json';

function findValue(page, id) {
  return page.Fields.find(field => field.id.Id === id)?.V;
}

function getValueList(page, ids) {
  const out = [];
  ids.forEach(([id, name]) => {
    const roll = parseInt(findValue(page, id));
    if (isNaN(roll)) return;
    out.push({ name: name ?? id, roll });
  });
  return out;
}

function findPage(pages, text) {
  return pages.find(page => page.Texts.map(element => element.R[0]?.T).includes(text));
}

export function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        const characterName = findValue(pdfData.Pages[0], 'CharacterName');
        const classLevel = findValue(pdfData.Pages[0], 'CLASS_LEVEL');
        const race = findValue(pdfData.Pages[0], 'RACE');
        const background = findValue(pdfData.Pages[0], 'BACKGROUND');
        const ac = parseInt(findValue(pdfData.Pages[0], 'AC')) || 0;
        const maxHP = parseInt(findValue(pdfData.Pages[0], 'MaxHP')) || 0;
        const profBonus = parseInt(findValue(pdfData.Pages[0], 'ProfBonus')) || 0;
        const initiative = parseInt(findValue(pdfData.Pages[0], 'Init')) || 0;
        const passivePerception = parseInt(findValue(pdfData.Pages[0], 'Passive1')) || 0;
        const passiveInsight = parseInt(findValue(pdfData.Pages[0], 'Passive2')) || 0;
        const passiveInvestigation = parseInt(findValue(pdfData.Pages[0], 'Passive3')) || 0;

        // Appearance & personality (from page 4 - typically index 3)
        const appearancePage = pdfData.Pages[3] || pdfData.Pages[0];
        const gender = findValue(appearancePage, 'GENDER') || null;
        const age = findValue(appearancePage, 'AGE') || null;
        const height = findValue(appearancePage, 'HEIGHT') || null;
        const weight = findValue(appearancePage, 'WEIGHT') || null;
        const alignment = findValue(appearancePage, 'ALIGNMENT') || null;
        const faith = findValue(appearancePage, 'FAITH') || null;
        const skin = findValue(appearancePage, 'SKIN') || null;
        const eyes = findValue(appearancePage, 'EYES') || null;
        const hair = findValue(appearancePage, 'HAIR') || null;
        const personalityTraits = findValue(appearancePage, 'PersonalityTraits_') || null;
        const ideals = findValue(appearancePage, 'Ideals') || null;
        const bonds = findValue(appearancePage, 'Bonds') || null;
        const flaws = findValue(appearancePage, 'Flaws') || null;

        const weaponNames = pdfData.Pages[0].Fields
          .filter(field => /Wpn_Name(_[1-6])?/.test(field.id.Id))
          .map(field => field.V);
        const weaponAttack = pdfData.Pages[0].Fields
          .filter(field => /Wpn[1-6]_AtkBonus/.test(field.id.Id))
          .map(field => parseInt(field.V));
        const weaponDamage = pdfData.Pages[0].Fields
          .filter(field => /Wpn[1-6]_Damage/.test(field.id.Id))
          .map(field => field.V);

        const attacks = weaponNames
          .map((name, idx) => {
            const maybeDamage = weaponDamage[idx]?.split(' ')[0];
            return {
              name,
              roll: weaponAttack[idx],
              damage: maybeDamage?.includes('d') ? maybeDamage : undefined
            };
          })
          .filter(({ roll: attack }) => !isNaN(attack));

        const spellPage = findPage(pdfData.Pages, 'SPELLCASTING');
        const spellAttack = spellPage ? parseInt(findValue(spellPage, 'spellAtkBonus0')) : NaN;
        if (!isNaN(spellAttack)) {
          attacks.push({ name: 'Spell Attack', roll: spellAttack });
        }

        const abilityChecks = getValueList(pdfData.Pages[0], [
          ['Init', 'Initiative'],
          ['Acrobatics'],
          ['Animal', 'Animal Handling'],
          ['Arcana'],
          ['Athletics'],
          ['Deception'],
          ['History'],
          ['Insight'],
          ['Intimidation'],
          ['Investigation'],
          ['Medicine'],
          ['Nature'],
          ['Perception'],
          ['Performance'],
          ['Persuasion'],
          ['Religion'],
          ['SleightofHand', 'Sleight of Hand'],
          ['Stealth_', 'Stealth'],
          ['Survival']
        ]);

        const attributes = getValueList(pdfData.Pages[0], [
          ['STR', 'Strength'],
          ['DEX', 'Dexterity'],
          ['CON', 'Constitution'],
          ['INT', 'Intelligence'],
          ['WIS', 'Wisdom'],
          ['CHA', 'Charisma']
        ]);

        const saves = getValueList(pdfData.Pages[0], [
          ['ST_Strength', 'Strength Save'],
          ['ST_Dexterity', 'Dexterity Save'],
          ['ST_Constitution', 'Constitution Save'],
          ['ST_Intelligence', 'Intelligence Save'],
          ['ST_Wisdom', 'Wisdom Save'],
          ['ST_Charisma', 'Charisma Save']
        ]);

        resolve({
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
          appearance: {
            gender,
            age,
            height,
            weight,
            alignment,
            faith,
            skin,
            eyes,
            hair
          },
          traits: {
            personalityTraits,
            ideals,
            bonds,
            flaws
          },
          attacks,
          abilityChecks,
          attributes,
          saves
        });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
