import { useEffect, useState } from 'react';
import styled from 'styled-components';

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 50vw;
  margin: 10px;

  div {
    border: 1px solid black;
    display: flex;
    padding: 2px;
    cursor: context-menu;
  }
`;

const Name = styled.div`
  flex: 1;
`;

const Locked = styled.button`
  width: 100px;
`;
const Buy = styled.button`
  width: 100px;
`;

const MariosStore = ({ store, messageSetter }) => {
  return (
    <div>
      <h1>JEWELS OF MARIO - mexican grocery store</h1>
      <ItemGrid
        onMouseLeave={() =>
          messageSetter('Welcome to my adventuring party. Explore!')
        }
      >
        {store?.map((item) => {
          return (
            <div key={item.name + 'item'}>
              <Name
                onMouseEnter={() =>
                  messageSetter(
                    `${item.name.toUpperCase()}: ${item.description}`,
                  )
                }
              >
                {item.name}
              </Name>
              {item.isLocked ? (
                <Locked>Locked</Locked>
              ) : (
                <Buy>buy for {item.price}</Buy>
              )}
            </div>
          );
        })}
      </ItemGrid>
    </div>
  );
};

export default MariosStore;
