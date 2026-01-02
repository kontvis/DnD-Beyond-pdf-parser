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

        resolve({ characterName, attacks, abilityChecks, attributes, saves });
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}
