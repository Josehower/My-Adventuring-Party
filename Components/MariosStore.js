import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { bagQuery } from './PlayerBag';

const ItemGrid = styled.div`
  display: grid;
  max-width: 60vw;
  padding: 5px;
  grid-template-columns: 1fr 1fr;
  margin: 10px;
  border-radius: 5px;
  gap: 5px;
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  font-family: 'VT323', monospace;
  border: white solid 2px;

  h1 {
    grid-column: span 2;
    font-family: 'VT323', monospace;
    font-size: 1.6em;
  }

  div {
    display: flex;
    gap: 3px;
    padding: 2px;
    cursor: context-menu;
    border-radius: 5px;
    height: 3em;
    &:hover {
      background: #000000aa;
    }

    div {
      padding: 5px;
      max-width: 45vw;
      background: none;
      &:hover {
        background: none;
      }
    }
    button {
      background: none;
      color: white;
      font-family: 'VT323', monospace;
      font-size: 1.4em;
      flex: 0.5;
      border: transparent solid 2px;
      &:hover {
        border: white solid 2px;
      }
    }
  }
`;

const Name = styled.div`
  flex: 1.5;
  font-size: 1.5em;
`;

const Locked = styled.button`
  width: 150px;
  border-radius: 5px;
`;
const Buy = styled.button`
  border-radius: 5px;
`;

const buyItemMutation = gql`
  mutation buyItem($itemId: Int!, $gameId: Int!, $withSoulStones: Boolean) {
    buyItem(itemId: $itemId, gameId: $gameId, withSoulStones: $withSoulStones) {
      message
    }
  }
`;

export const getStoreQuerry = gql`
  query playerStore($id: Int!) {
    playerStore(id: $id) {
      name
      price
      isLocked
      description
      gameId
      itemId
    }
  }
`;

const MariosStore = ({ messageSetter, gameId = 0 }) => {
  const { data: playerStoreData, refetch: storeRefetch } = useQuery(
    getStoreQuerry,
    {
      variables: { id: gameId },
    },
  );

  const [buyItem] = useMutation(buyItemMutation, {
    refetchQueries: [
      {
        query: bagQuery,
        variables: { gameId: gameId },
      },
    ],
  });

  let initialStore = [];
  if (playerStoreData) {
    initialStore = playerStoreData.playerStore;
  }

  const [renderedStore, setRenderedStore] = useState(initialStore);

  useEffect(() => {
    if (playerStoreData) {
      const { playerStore } = playerStoreData;
      setRenderedStore(playerStore);
    }
  }, [playerStoreData]);

  async function buyItemHandler(itemId, gameId, withSoulStones = false) {
    const { data } = await buyItem({
      variables: {
        itemId: itemId,
        gameId: gameId,
        withSoulStones: withSoulStones,
      },
    });
    const { message } = data.buyItem;
    messageSetter(message);
    // refetch();
  }

  return (
    <div>
      <ItemGrid
        onMouseLeave={() =>
          messageSetter('Welcome to my adventuring party. Explore!')
        }
      >
        <h1>JEWELS OF MARIO - mexican grocery store</h1>
        {[...renderedStore]
          .sort((a, b) => a.itemId - b.itemId)
          .map((item) => {
            return (
              <div
                onMouseEnter={() =>
                  messageSetter(
                    `${item.name.toUpperCase()}: ${item.description}`,
                  )
                }
                key={item.name + 'item'}
              >
                <Name>{item.name}</Name>
                {item.isLocked ? (
                  <Locked onClick={() => storeRefetch()}>Locked</Locked>
                ) : (
                  <Buy onClick={() => buyItemHandler(item.itemId, item.gameId)}>
                    buy {item.price}
                  </Buy>
                )}
              </div>
            );
          })}
      </ItemGrid>
    </div>
  );
};

export default MariosStore;
