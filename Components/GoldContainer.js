import { useState } from 'react';

const GoldContainer = () => {
  const [gold, setGold] = useState(0);

  function createGold() {
    let goldAmount = gold;
    goldAmount++;
    setGold(goldAmount);
  }

  return (
    <div>
      {gold}
      <button onClick={createGold}>gold</button>
    </div>
  );
};

export default GoldContainer;
