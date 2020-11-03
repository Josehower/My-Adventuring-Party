const itemTypes = [
  {
    type_name: 'battle',
    description: 'this items are intended to be used on battle as an action.',
  },
  {
    type_name: 'enhancement',
    description:
      'this items are intended to be used outside battle to enhance the skills of a helden.',
  },
];

const itemRarities = [
  { rarity_name: 'common' },
  { rarity_name: 'uncommon' },
  { rarity_name: 'rare' },
  { rarity_name: 'phantom' },
];

const itemInventory = [
  {
    name: 'basic potion',
    price: 20,
    description: 'give back 20% of the helden total VE.',
    type: 'battle',
    rarity: 'common',
    soul_stones_price: null,
    unlock_price: null,
  },
  {
    name: 'royal potion',
    price: 80,
    description: 'give back 50% of the helden total VE.',
    type: 'battle',
    rarity: 'uncommon',
    soul_stones_price: 1,
    unlock_price: null,
  },
  {
    name: 'nova potion',
    price: 120,
    description: 'give back 100% of the helden total VE.',
    type: 'battle',
    rarity: 'rare',
    soul_stones_price: 2,
    unlock_price: null,
  },
  {
    name: 'phantom potion',
    price: 500,
    description: 'give back 50%  total VE for the hole helden party.',
    type: 'battle',
    rarity: 'phantom',
    soul_stones_price: 5,
    unlock_price: 10,
  },
  {
    name: "Jenna's rounded baked cake",
    price: 10000,
    description:
      'give a helden +10% on VE or AP stats (use an experience shard).',
    type: 'enhancement',
    rarity: 'rare',
    soul_stones_price: 10,
    unlock_price: null,
  },
  {
    name: "Marion's special brew beer",
    price: 10000,
    description:
      'give a helden +4 on PD or SD stats (use an experience shard).',
    type: 'enhancement',
    rarity: 'rare',
    soul_stones_price: 10,
    unlock_price: null,
  },
  {
    name: 'Max & Benito meal',
    price: 20000,
    description:
      'give a helden +4 on PD or SD stats (use an experience shard).',
    type: 'enhancement',
    rarity: 'phantom',
    soul_stones_price: 20,
    unlock_price: 30,
  },
];

exports.up = async (sql) => {
  const types = await sql`
  INSERT INTO item_types ${sql(
    itemTypes,
    'type_name',
    'description',
  )} RETURNING *`;

  const rarities = await sql`
	INSERT INTO item_rarities ${sql(itemRarities, 'rarity_name')} RETURNING *`;

  const itemsPrepared = itemInventory.map((item) => {
    const { item_type_id } = types.find((type) => type.type_name === item.type);
    const { item_rarity_id } = rarities.find(
      (rarity) => rarity.rarity_name === item.rarity,
    );
    preparedItem = { ...item, item_type_id, item_rarity_id };
    delete preparedItem.type;
    delete preparedItem.rarity;
    return preparedItem;
  });

  const items = await sql`
	INSERT INTO items ${sql(
    itemsPrepared,
    'name',
    'price',
    'soul_stones_price',
    'unlock_price',
    'description',
    'item_type_id',
    'item_rarity_id',
  )}`;
};

exports.down = async (sql) => {
  await sql`
      DELETE FROM item_types;
		`;
  await sql`
      DELETE FROM item_rarities;
		`;
  await sql`
      DELETE FROM items;
    `;
};
