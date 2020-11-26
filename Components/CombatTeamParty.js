import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  gap: 50px;
`;

const CharacterAvatar = styled.img`
  height: 10vh;
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
      ? 'transform: rotate(270deg) translate(0) scale(-1, 1);'
      : ''}
`;

const CombatTeamParty = (props) => {
  return (
    <div>
      {props.clientInfo.playerTeam
        .sort((a, b) => a.slotPosition - b.slotPosition)
        .map((helden, index) => (
          <Wrapper>
            <div>
              <h2 key={helden.heldenId}>
                {helden.name} {helden.class.className}
              </h2>
              <CharacterAvatar
                isDead={helden.instanceVe === 0}
                active={helden.slotPosition === props.active ? true : false}
                targeted={helden.slotPosition === props.targeted ? true : false}
                healed={helden.slotPosition === props.healed ? true : false}
                src={`/helden${helden.class.classImg}`}
                alt={helden.class.className}
              />
            </div>
            <div>
              <h3>
                VE: {helden.instanceVe}/
                {props.clientHistory[0].playerTeam[index].instanceVe}
              </h3>
              <h3>
                {props.clientHistory[
                  props.clientInfo.combatInstance.actualTurn - 1
                ]?.playerTeam[index].instanceVe -
                  props.clientHistory[
                    props.clientInfo.combatInstance.actualTurn - 2
                  ]?.playerTeam[index].instanceVe}
              </h3>
              <h3>
                SA: {helden.saAvaliable}/
                {props.clientHistory[0].playerTeam[index].saAvaliable}
              </h3>
              <h3>AP: {helden.ap}</h3>
              <h3>PD: {helden.pd}</h3>
              <h3>SD: {helden.sd}</h3>
            </div>
            {helden.instanceVe <= 0 ? (
              ''
            ) : (
              <form name="actions">
                <select
                  name={`playerTeam.${helden.slotPosition - 1}.actionId`}
                  id={`action-${helden.heldenInstanceId}`}
                  ref={props.register({ required: true })}
                >
                  {helden.actions.map((action) => (
                    <option
                      selected={action.name === 'basic attack' ? true : false}
                      value={action.actionId}
                    >
                      {action.name}
                    </option>
                  ))}
                </select>

                <select
                  name={`playerTeam.${helden.slotPosition - 1}.target`}
                  id={`target-${helden.heldenInstanceId}`}
                  ref={props.register({ required: true })}
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
                          <option value={creature.creatureInstanceId}>
                            {creature.name} {creature.slotPosition}
                          </option>
                        );
                      })
                    : props.clientInfo.playerTeam.map((helden) => {
                        return (
                          <option value={helden.heldenInstanceId}>
                            {helden.name} {helden.slotPosition}
                          </option>
                        );
                      })}
                </select>
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
              </form>
            )}
          </Wrapper>
        ))}
    </div>
  );
};

export default CombatTeamParty;
