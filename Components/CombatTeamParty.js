import styled from 'styled-components';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
  gap: 5px;
`;

const AvatarDiv = styled.div`
  cursor: context-menu;
  position: relative;
  &::before {
    content: '';
    visibility: hidden;
    position: absolute;
    right: 3rem;
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
  height: 13vh;
  transition: all 0.25s;
  transform: translate(40px) scale(-1, 1) rotate(0);
  ${(props) =>
    props.isDead
      ? '  transition: all 0.9s; transform: rotate(270deg) scale(-1, 1); filter: grayscale(100%);'
      : ''}
  ${(props) => (props.active ? 'transform: translate(70px) scale(-1, 1);' : '')}
  ${(props) =>
    props.healed
      ? 'transform: translate(50px) rotate3d(0, 1, 0, 180deg) scale(-1,1);'
      : ''}
  ${(props) =>
    props.targeted
      ? 'transform: rotate(270deg) translate(0,20px) scale(-1, 1);'
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
    rgba(255, 190, 0, 1) 0%,
    rgba(196, 130, 0, 1) 19%,
    rgba(223, 38, 68, 1) 76%,
    rgba(242, 0, 0, 1) 96%,
    rgba(255, 0, 0, 1) 100%
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
  background: #a30a0a;
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
  justify-self: right;
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
    props.isActive !== 'party' ? 'background: gray; pointer-events: none;' : ''}
`;

const TargetSelect = styled.select`
  background: ${(props) => (props.target === 'enemy' ? '#6f0090' : '#a30a0a')};
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
    props.isActive !== 'party' ? 'background: gray; pointer-events: none;' : ''}
`;

const CombatTeamParty = (props) => {
  return (
    <TeamFrame>
      {props.clientInfo.playerTeam
        .sort((a, b) => a.slotPosition - b.slotPosition)
        .map((helden, index) => (
          <Wrapper>
            {helden.instanceVe <= 0 ? (
              <div></div>
            ) : (
              <Form name="actions">
                <ActionSelect
                  name={`playerTeam.${helden.slotPosition - 1}.actionId`}
                  id={`action-${helden.heldenInstanceId}`}
                  ref={props.register({ required: true })}
                  isActive={props.teamPriority[props.combatStep]}
                >
                  {helden.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </ActionSelect>
                <TargetSelect
                  name={`playerTeam.${helden.slotPosition - 1}.target`}
                  id={`target-${helden.heldenInstanceId}`}
                  ref={props.register({ required: true })}
                  isActive={props.teamPriority[props.combatStep]}
                  target={
                    helden.actions.find((action) => {
                      const basicId = helden.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `playerTeam.${helden.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target
                  }
                >
                  {helden.actions.find((action) => {
                    const basicId = helden.actions
                      .find((action) => action.name === 'basic attack')
                      .actionId.toString(10);
                    return (
                      action.actionId.toString(10) ===
                      props.watch(
                        `playerTeam.${helden.slotPosition - 1}.actionId`,
                        basicId,
                      )
                    );
                  })?.target === 'enemy'
                    ? props.clientInfo.enemyTeam.map((creature) => {
                        return (
                          <option
                            selected={
                              helden.slotPosition === creature.slotPosition
                                ? true
                                : false
                            }
                            value={creature.creatureInstanceId}
                          >
                            {creature.name} {creature.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.playerTeam.map((heldenTarget) => {
                        return (
                          <option
                            selected={
                              helden.slotPosition === heldenTarget.slotPosition
                                ? true
                                : false
                            }
                            value={heldenTarget.heldenInstanceId}
                          >
                            {heldenTarget.name} {heldenTarget.slotPosition}
                          </option>
                        );
                      })}
                </TargetSelect>
                <input
                  name={`playerTeam.${
                    helden.slotPosition - 1
                  }.heldenInstanceId`}
                  id={`helden-${helden.heldenInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={helden.heldenInstanceId}
                ></input>
                <input
                  name={`playerTeam.${helden.slotPosition - 1}.team`}
                  id={`teamKey-${helden.heldenInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={'helden'}
                ></input>
                <input
                  name={`playerTeam.${helden.slotPosition - 1}.targetKey`}
                  id={`targetPos-${helden.heldenInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={
                    helden.actions.find((action) => {
                      const basicId = helden.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `playerTeam.${helden.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target
                  }
                ></input>
                <input
                  name={`playerTeam.${helden.slotPosition - 1}.TargetPosistion`}
                  id={`targetPos-${helden.heldenInstanceId}`}
                  ref={props.register()}
                  type="hidden"
                  value={
                    helden.actions.find((action) => {
                      const basicId = helden.actions
                        .find((action) => action.name === 'basic attack')
                        .actionId.toString(10);
                      return (
                        action.actionId.toString(10) ===
                        props.watch(
                          `playerTeam.${helden.slotPosition - 1}.actionId`,
                          basicId,
                        )
                      );
                    })?.target === 'enemy'
                      ? props.clientInfo.enemyTeam.find(
                          (enemy) =>
                            enemy.creatureInstanceId ===
                            parseInt(
                              props.watch(
                                `playerTeam.${helden.slotPosition - 1}.target`,
                                props.clientInfo.enemyTeam[0]
                                  .creatureInstanceId,
                              ),
                              10,
                            ),
                        )?.slotPosition
                      : props.clientInfo.playerTeam.find(
                          (refHelden) =>
                            refHelden.heldenInstanceId ===
                            parseInt(
                              props.watch(
                                `playerTeam.${helden.slotPosition - 1}.target`,
                                props.clientInfo.playerTeam[0].heldenInstanceId,
                              ),
                              10,
                            ),
                        )?.slotPosition
                  }
                ></input>
              </Form>
            )}
            <InfoWrapper>
              <CharacterName key={helden.heldenId}>{helden.name}</CharacterName>
              <h3>
                {helden.slotPosition === props.targeted[0] ||
                helden.slotPosition === props.healed[0] ? (
                  <DamageLog>
                    {props.targeted[1]}
                    {props.healed[1]}
                  </DamageLog>
                ) : (
                  ''
                )}
                {'  '}
                VE: {helden.instanceVe}/
                {props.initialState.playerTeam[index].instanceVe}
              </h3>

              <VitalityBar
                maxVe={props.initialState.playerTeam[index].instanceVe}
                currentVe={helden.instanceVe}
              />
              <SaWrapper>
                <div> SA:</div>
                {new Array(props.initialState.playerTeam[index].saAvaliable)
                  .fill('')
                  .map((slot, index) => {
                    if (index < helden.saAvaliable) {
                      return <Sa active />;
                    } else {
                      return <Sa />;
                    }
                  })}
              </SaWrapper>
            </InfoWrapper>
            <AvatarDiv
              ap={helden.ap}
              pd={helden.pd}
              sd={helden.sd}
              combatStep={props.combatStep}
            >
              <CharacterAvatar
                isDead={helden.instanceVe === 0}
                active={helden.slotPosition === props.active ? true : false}
                targeted={
                  helden.slotPosition === props.targeted[0] ? true : false
                }
                healed={helden.slotPosition === props.healed[0] ? true : false}
                src={`/helden${helden.class.classImg}`}
                alt={helden.class.className}
              />
            </AvatarDiv>
          </Wrapper>
        ))}
    </TeamFrame>
  );
};

export default CombatTeamParty;
