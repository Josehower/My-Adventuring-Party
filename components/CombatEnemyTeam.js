import styled from 'styled-components';

const EnemyWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  gap: 10px;
`;

const AvatarDiv = styled.div`
  cursor: context-menu;
  position: relative;
  /* background: rgba(0, 0, 0, 0.12); */
  &::before {
    content: '';
    visibility: hidden;
    position: absolute;
    right: 2rem;
    top: 1.5rem;
    width: 4rem;
    background: black;
    padding: 3px;
    z-index: 3;

    ${(props) => `content: 'AP: ${props.ap} PD: ${props.pd} SD: ${props.sd}';`}
  }
  &:hover::before {
    visibility: visible;
  }

  ${(props) => (props.combatStep === -1 ? 'pointer-events: none;' : '')}
`;

const CharacterAvatar = styled.img`
  filter: hue-rotate(270deg);
  height: 13vh;
  transition: all 0.25s;
  transform: translate(20px) scale(1);
  ${(props) =>
    props.isDead
      ? '  transition: all 0.9s; transform: rotate(-270deg) scale(1); filter: grayscale(100%);'
      : ''}
  ${(props) => (props.active ? 'transform: translate(-20px) scale(1);' : '')}
  ${(props) =>
    props.healed
      ? 'transform: translate(0, 10px) rotate3d(0, 1, 0, -180deg) scale(1);'
      : ''}
  ${(props) =>
    props.targeted
      ? 'transform: rotate(-270deg) translate(0, -80px) scale(1);'
      : ''}
`;

const DamageLog = styled.p`
  display: inline;
  margin-right: 0.5rem;
  margin-left: -2rem;
  ${(props) => (parseInt(props.children[1], 10) > 0 ? 'color: #02e934;' : '')}
  ${(props) => (parseInt(props.children[0], 10) < 0 ? 'color: #da005b;' : '')}
  ${(props) => (props.children.includes('Miss') ? 'color: #029bf3;' : '')}
  ${(props) => (props.children.includes('N/A') ? 'color: #f3cf02;' : '')}
`;

const SaWrapper = styled.div`
  display: flex;
  gap: 5px;
`;

const Sa = styled.div`
  background: radial-gradient(
    circle,
    rgba(152, 0, 195, 1) 0%,
    rgba(66, 17, 219, 1) 64%,
    rgba(255, 0, 0, 1) 81%,
    rgba(253, 151, 45, 1) 96%,
    rgba(250, 241, 0, 1) 100%
  );

  position: relative;
  width: 15px;
  height: 15px;
  border: 1px solid white;
  border-radius: 50%;

  &::before {
    content: '';
    position: absolute;
    background: black;
    width: 15px;
    height: 15px;
    border: 1px solid white;
    border-radius: 50%;
    margin: -1px;
    transition: all 2.5s;
    opacity: 1;
    ${(props) => (props.active ? 'opacity:0;' : '')};
  }
`;

const VitalityBar = styled.div`
  background: gray;
  width: 90px;
  height: 5px;
  border-radius: 3px;
  box-shadow: 1px 1px black;
  margin: 5px;

  &::after {
    content: ' ';
    position: absolute;
    border-radius: 3px;
    background: ${(props) => {
      const healtPercentage = (props.currentVe * 90) / props.maxVe;
      let color;
      if (healtPercentage > 80) color = 'green';
      if (healtPercentage > 30 && healtPercentage < 81) color = 'orange';
      if (healtPercentage < 31) color = 'red';
      return color;
    }};
    transition: all 2s;
    width: ${(props) => (props.currentVe * 90) / props.maxVe}px;
    height: 5px;
  }
`;

const CharacterName = styled.h2`
  width: 120px;
  text-shadow: 2px 2px black;
  margin-bottom: 2px;
  text-align: center;
  text-transform: capitalize;
  margin: 2px 0;
  padding: 2px;
  background: #6b008b;
  border-radius: 5px;
`;

const TeamFrame = styled.div`
  background-color: rgba(53, 37, 0, 0.4);
  padding: 10px;
`;

const InfoWrapper = styled.div`
  display: grid;
  justify-items: center;
  border-radius: 5px;
  border: 3px white solid;
  margin: 5px;
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  padding: 3px;
`;

const Form = styled.form`
  align-self: center;
  display: grid;
  justify-items: end;
`;

const ActionSelect = styled.select`
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  border: white 1px solid;
  text-shadow: 1px 1px black;
  color: white;
  border-radius: 5px;
  text-transform: capitalize;
  padding: 5px;
  width: 100%;
  cursor: pointer;
  ${(props) =>
    props.isActive !== 'enemy' ? 'background: gray; pointer-events: none;' : ''}
`;

const TargetSelect = styled.select`
  background: ${(props) => (props.target === 'enemy' ? '#a30a0a' : '#6f0090')};
  border: white 1px solid;
  text-shadow: 1px 1px black;
  color: white;
  border-radius: 5px;
  text-transform: capitalize;
  padding: 5px;
  width: 80%;
  margin-top: 2px;
  cursor: pointer;
  ${(props) =>
    props.isActive !== 'enemy' ? 'background: gray; pointer-events: none;' : ''}
`;

const CombatEnemyTeam = (props) => {
  return (
    <TeamFrame>
      {props.clientInfo.enemyTeam
        ?.sort((a, b) => a.slotPosition - b.slotPosition)
        ?.map((creature, index) => (
          <EnemyWrapper>
            <AvatarDiv
              ap={creature.ap}
              pd={creature.pd}
              sd={creature.sd}
              combatStep={props.combatStep}
            >
              <CharacterAvatar
                isDead={creature.instanceVe === 0}
                active={creature.slotPosition === props.active ? true : false}
                targeted={
                  creature.slotPosition === props.targeted[0] ? true : false
                }
                healed={
                  creature.slotPosition === props.healed[0] ? true : false
                }
                src={`/creatures${creature.type.typeImage}`}
                alt={creature.type.typeName}
              />
            </AvatarDiv>
            <InfoWrapper>
              <CharacterName key={creature.creatureId}>
                {creature.name} {creature.slotPosition}
              </CharacterName>
              <h3>
                {creature.slotPosition === props.targeted[0] ||
                creature.slotPosition === props.healed[0] ? (
                  <DamageLog>
                    {props.targeted[1]}
                    {props.healed[1]}
                  </DamageLog>
                ) : (
                  ''
                )}
                {'  '}
                VE: {creature.instanceVe}/
                {props.initialState.enemyTeam[index].instanceVe}
              </h3>

              <VitalityBar
                maxVe={props.initialState.enemyTeam[index].instanceVe}
                currentVe={creature.instanceVe}
              />
              <SaWrapper>
                <div> SA:</div>
                {new Array(props.initialState.enemyTeam[index].saAvaliable)
                  .fill('')
                  .map((slot, index) => {
                    if (index < creature.saAvaliable) {
                      return <Sa active />;
                    } else {
                      return <Sa />;
                    }
                  })}
              </SaWrapper>
            </InfoWrapper>
            {creature.instanceVe <= 0 ? (
              ''
            ) : (
              <Form name="actions">
                <ActionSelect
                  name={`enemyTeam.${creature.slotPosition - 1}.actionId`}
                  id={`action-${creature.creatureInstanceId}`}
                  ref={props.register({ required: true })}
                  isActive={props.teamPriority[props.combatStep]}
                >
                  {creature.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </ActionSelect>
                <TargetSelect
                  name={`enemyTeam.${creature.slotPosition - 1}.target`}
                  id={`targetHelden-${creature.creatureInstanceId}`}
                  ref={props.register({ required: true })}
                  isActive={props.teamPriority[props.combatStep]}
                  target={
                    creature.actions.find((action) => {
                      const basicId = creature.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `enemyTeam.${creature.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target
                  }
                >
                  {creature.actions.find((action) => {
                    const basicId = creature.actions
                      .find((action) => action.name === 'basic attack')
                      .actionId.toString(10);
                    return (
                      action.actionId.toString(10) ===
                      props.watch(
                        `enemyTeam.${creature.slotPosition - 1}.actionId`,
                        basicId,
                      )
                    );
                  })?.target === 'enemy'
                    ? props.clientInfo.playerTeam.map((helden) => {
                        return (
                          <option
                            selected={
                              helden.slotPosition === creature.slotPosition
                                ? true
                                : false
                            }
                            value={helden.heldenInstanceId}
                          >
                            {helden.name} {helden.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.enemyTeam.map((creatureTarget) => {
                        return (
                          <option
                            selected={
                              creatureTarget.slotPosition ===
                              creature.slotPosition
                                ? true
                                : false
                            }
                            value={creatureTarget.creatureInstanceId}
                          >
                            {creatureTarget.name} {creatureTarget.slotPosition}
                          </option>
                        );
                      })}
                </TargetSelect>
                <input
                  name={`enemyTeam.${
                    creature.slotPosition - 1
                  }.creatureInstanceId`}
                  id={`creature-${creature.creatureInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={creature.creatureInstanceId}
                ></input>
                <input
                  name={`enemyTeam.${creature.slotPosition - 1}.team`}
                  id={`teamKey-${creature.creatureInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={'creature'}
                ></input>
                <input
                  name={`enemyTeam.${creature.slotPosition - 1}.targetKey`}
                  id={`targetPos-${creature.creatureInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={
                    creature.actions.find((action) => {
                      const basicId = creature.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `enemyTeam.${creature.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target
                  }
                ></input>
                <input
                  name={`enemyTeam.${
                    creature.slotPosition - 1
                  }.TargetPosistion`}
                  id={`targetPos-${creature.creatureInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={
                    creature.actions.find((action) => {
                      const basicId = creature.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `enemyTeam.${creature.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target === 'enemy'
                      ? props.clientInfo.playerTeam.find(
                          (helden) =>
                            helden.heldenInstanceId ===
                            parseInt(
                              props.watch(
                                `enemyTeam.${creature.slotPosition - 1}.target`,
                                props.clientInfo.playerTeam[0].heldenInstanceId,
                              ),
                              10,
                            ),
                        )?.slotPosition
                      : props.clientInfo.enemyTeam.find(
                          (enemy) =>
                            enemy.creatureInstanceId ===
                            parseInt(
                              props.watch(
                                `enemyTeam.${creature.slotPosition - 1}.target`,
                                props.clientInfo.enemyTeam[0]
                                  .creatureInstanceId,
                              ),
                              10,
                            ),
                        )?.slotPosition
                  }
                ></input>
              </Form>
            )}
          </EnemyWrapper>
        ))}
    </TeamFrame>
  );
};

export default CombatEnemyTeam;
