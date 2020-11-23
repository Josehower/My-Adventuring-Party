const creatureTypes = [
  {
    creature_type_name: 'dark warrior',
    creature_type_image: '/dark-warrior.png',
    description: 'this warrior is driven for the hate and the greed',
  },
  {
    creature_type_name: 'dark healer',
    creature_type_image: '/dark-healer.png',
    description: 'this healer is driven for the hate and the greed',
  },
  {
    creature_type_name: 'dark archer',
    creature_type_image: '/dark-archer.png',
    description: 'this archer is driven for the hate and the greed',
  },
  {
    creature_type_name: 'dark mage',
    creature_type_image: '/dark-mage.png',
    description: 'this mage is driven for the hate and the greed',
  },
];

exports.up = async (sql) => {
  await sql`
INSERT INTO creature_type ${sql(
    creatureTypes,
    'creature_type_name',
    'creature_type_image',
    'description',
  )};`;
};

exports.down = async (sql) => {
  await sql`
DELETE FROM creature_type;`;
};
