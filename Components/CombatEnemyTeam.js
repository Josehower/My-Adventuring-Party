import styled from 'styled-components';

const EnemyWrapper = styled.div`
  display: flex;
  gap: 50px;
`;

const AvatarDiv = styled.div`
  cursor: context-menu;
  position: relative;
  &::before {
    content: '';
    visibility: hidden;
    position: absolute;
    left: -3rem;
    top: 1.5rem;
    width: 3.5rem;
    background: black;
    padding: 3px;

    ${(props) => `content: 'AP: ${props.ap} PD: ${props.pd} SD: ${props.sd}';`}
  }
  &:hover::before {
    visibility: visible;
  }
`;

const CharacterAvatar = styled.img`
  filter: hue-rotate(270deg);
  height: 10vh;
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
  ${(props) => (props.children > 0 ? 'color: green;' : '')}
  ${(props) => (props.children < 0 ? 'color: red;' : '')}
`;

const SaWrapper = styled.div`
  display: flex;
  gap: 5px;
`;

const SaFull = styled.div`
  background: green;
  width: 15px;
  height: 15px;
  border: 1px solid white;
  border-radius: 50%;
`;
const SaEmpty = styled.div`
  background: gray;
  width: 15px;
  height: 15px;
  border: 1px solid white;
  border-radius: 50%;
`;

const Test = styled.div``;

const CombatEnemyTeam = (props) => {
  return (
    <div>
      {props.clientInfo.enemyTeam
        .sort((a, b) => a.slotPosition - b.slotPosition)
        .map((creature, index) => (
          <EnemyWrapper>
            <AvatarDiv ap={creature.ap} pd={creature.pd} sd={creature.sd}>
              <h2 key={creature.creatureId}>
                {creature.name} {creature.slotPosition}
              </h2>
              <CharacterAvatar
                isDead={creature.instanceVe === 0}
                active={creature.slotPosition === props.active ? true : false}
                targeted={
                  creature.slotPosition === props.targeted ? true : false
                }
                healed={creature.slotPosition === props.healed ? true : false}
                src={`/creatures${creature.type.typeImage}`}
                alt={creature.type.typeName}
              />
            </AvatarDiv>
            <div>
              <h3>
                {props.clientInfo.combatInstance.actualTurn !== 1 ? (
                  props.clientHistory[
                    props.clientInfo.combatInstance.actualTurn - 1
                  ]?.enemyTeam[index].instanceVe -
                    props.clientHistory[
                      props.clientInfo.combatInstance.actualTurn - 2
                    ]?.enemyTeam[index].instanceVe !==
                  0 ? (
                    <DamageLog>
                      {props.clientHistory[
                        props.clientInfo.combatInstance.actualTurn - 1
                      ]?.enemyTeam[index].instanceVe -
                        props.clientHistory[
                          props.clientInfo.combatInstance.actualTurn - 2
                        ]?.enemyTeam[index].instanceVe}
                    </DamageLog>
                  ) : (
                    ''
                  )
                ) : (
                  ''
                )}
                {'  '}
                VE: {creature.instanceVe}/
                {props.clientHistory[0].enemyTeam[index].instanceVe}
              </h3>
              <SaWrapper>
                <div> SA:</div>
                {new Array(props.clientHistory[0].enemyTeam[index].saAvaliable)
                  .fill('')
                  .map((slot, index) => {
                    if (index < creature.saAvaliable) {
                      return <SaFull />;
                    } else {
                      return <SaEmpty />;
                    }
                  })}
              </SaWrapper>
            </div>
            {creature.instanceVe <= 0 ? (
              ''
            ) : (
              <form name="actions">
                <select
                  name={`enemyTeam.${creature.slotPosition - 1}.actionId`}
                  id={`action-${creature.creatureInstanceId}`}
                  ref={props.register({ required: true })}
                >
                  {creature.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </select>
                <select
                  name={`enemyTeam.${creature.slotPosition - 1}.target`}
                  id={`targetHelden-${creature.creatureInstanceId}`}
                  ref={props.register({ required: true })}
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
                          <option value={helden.heldenInstanceId}>
                            {helden.name} {helden.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.enemyTeam.map((creature) => {
                        return (
                          <option value={creature.creatureInstanceId}>
                            {creature.name} {creature.slotPosition}
                          </option>
                        );
                      })}
                </select>
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
              </form>
            )}
          </EnemyWrapper>
        ))}
    </div>
  );
};

export default CombatEnemyTeam;
