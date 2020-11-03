import styled from 'styled-components';

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  width: 50vw;
  margin: 10px;

  div {
    border: 1px solid black;
  }
`;

const Name = styled.div``;

const Locked = styled.button``;
const Buy = styled.button``;

const PlayerBag = ({ bag, nick }) => {
  return (
    <div>
      <h1>Items of {nick}</h1>
      <ItemGrid>
        {bag.map((item) => {
          return (
            <>
              <Name>{item.name}</Name>
              <div>{item.qty}</div>
            </>
          );
        })}
      </ItemGrid>
    </div>
  );
};

export default PlayerBag;
