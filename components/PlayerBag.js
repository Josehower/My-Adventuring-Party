import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';

const ItemGrid = styled.div`
  display: grid;
  width: 80vw;
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
    align-items: center;
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
  }
`;

const Name = styled.div`
  flex: 1.5;
  font-size: 1.5em;
`;

const Qty = styled.div`
  font-size: 1.4em;
  flex: 0.5;
  background: red;
  display: flex;
  justify-content: center;
`;

export const bagQuery = gql`
  query playerBag {
    playerBag {
      name
      itemId
      description
      qty
    }
  }
`;

const PlayerBag = ({ messageSetter = console.log, className }) => {
  const { data, loading, error } = useQuery(bagQuery);

  if (loading) return 'loading...';
  if (error) return `${error}`;

  const sortedBag = [...data.playerBag].sort((a, b) => a.itemId - b.itemId);

  return (
    <ItemGrid
      className={className}
      onMouseLeave={() =>
        messageSetter('Welcome to my adventuring party. Explore!')
      }
    >
      <h1>Your Bag</h1>
      {sortedBag.map((item) => {
        return (
          <div
            key={item.itemId + 'container'}
            onMouseEnter={() =>
              messageSetter(`${item.name.toUpperCase()}: ${item.description}`)
            }
          >
            <Name key={item.itemId + 'name'}>{item.name}</Name>
            <Qty key={item.itemId + 'qty'}>{item.qty}</Qty>
          </div>
        );
      })}
    </ItemGrid>
  );
};

export default PlayerBag;
