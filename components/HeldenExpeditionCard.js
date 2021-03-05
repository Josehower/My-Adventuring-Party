import React from 'react';
import styled from 'styled-components';
import Timer from './Timer';

const Card = styled.div`
  font-family: 'VT323', monospace;
  font-size: 1.5rem;
  border: white solid 3px;
  height: 33vw;
  border-radius: 5px;
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  & > div {
    margin-top: 10px;
    display: grid;
    height: 30vw;
    padding: 10px 0;
    grid-template-columns: 1fr;
    gap: 5px;
    justify-items: center;
    text-align: center;
    grid-template-rows: 1fr, 30px;
    align-content: space-around;
  }
`;

const Image = styled.img`
  height: 25vh;
`;

const TimerDiv = styled(Timer)`
  color: #3472f8;
  margin-top: 10px;
  width: 10vw;
  background: black;
  padding: 10px;
  border: white solid 2px;
  border-radius: 5px;
`;

const HeldenExpeditionCard = ({ expedition, refetch, index }) => {
  if (!expedition) {
    return (
      <Card>
        <div>
          <div>
            <h2> Expedition Slot</h2>
            <hr />
            <div># {index} - Avaliable</div>
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <div key={expedition.heldenId}>
        <Image
          src={`/helden${expedition.classImage}`}
          alt={expedition.className}
        />
        <h2>{expedition.name}</h2>{' '}
        <h3>
          {expedition.className} - lvl: {expedition.lvlLevel}
        </h3>
        <div>
          Time left:
          <TimerDiv
            className={'xyz'}
            heldenId={expedition.heldenId}
            refetcher={refetch}
          />
        </div>
      </div>
    </Card>
  );
};

export default HeldenExpeditionCard;
