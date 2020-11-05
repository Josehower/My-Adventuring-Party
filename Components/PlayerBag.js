import styled from 'styled-components';

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 50vw;
  margin: 10px;

  div {
    border: 1px solid black;
    display: flex;
    flex: 1;
    padding: 2px;
  }
`;

const Name = styled.div``;

const Locked = styled.button``;
const Buy = styled.button``;

const PlayerBag = ({ bag, nick, messageSetter }) => {
  return (
    <div>
      <h1>Items of {nick}</h1>
      <ItemGrid
        onMouseLeave={() =>
          messageSetter('Welcome to my adventuring party. Explore!')
        }
      >
        {bag.map((item) => {
          return (
            <div
              key={'bag'}
              onMouseEnter={() =>
                messageSetter(`${item.name.toUpperCase()}: ${item.description}`)
              }
            >
              <Name>{item.name}</Name>
              <div>{item.qty}</div>
            </div>
          );
        })}
      </ItemGrid>
    </div>
  );
};

export default PlayerBag;
