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

const MariosStore = ({ store }) => {
  return (
    <div>
      <h1>JEWELS OF MARIO - mexican grocery store</h1>
      <ItemGrid>
        {store.map((item) => {
          return (
            <>
              <Name>{item.name}</Name>
              {item.isLocked ? (
                <Locked>Locked</Locked>
              ) : (
                <Buy>buy for {item.price}</Buy>
              )}
            </>
          );
        })}
      </ItemGrid>
    </div>
  );
};

export default MariosStore;
