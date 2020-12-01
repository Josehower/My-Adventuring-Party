import styled from 'styled-components';
import Link from 'next/link';
import GoldContainer from './GoldContainer';

const LogOut = styled.a`
  cursor: pointer;
  border: black 1px solid;
  visibility: ${(props) => (props.isPlayerLogged ? 'visible' : 'hidden')};
  padding: 5px;
  border-radius: 5px;

  &:hover {
    background: rgb(254, 23, 0);
    background: linear-gradient(180deg, #c80606 0%, #950202 70%);
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 30px;
  background: #010142;
  color: white;
  margin-bottom: 1vh;
  user-select: none;

  h1 {
    font-family: 'VT323', monospace;
    font-size: 1.8em;
    background: -webkit-linear-gradient(#950202 0%, #ff3737 70%);
    background-clip: inherit;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  div {
    flex: 1;
  }
`;

const GlobalNav = (props) => {
  const isPlayerLogged = props.loggedIn;
  return (
    <>
      <Wrapper>
        <h1> My adventuring party</h1>
        <GoldContainer isPlayerLogged={isPlayerLogged} />
        <Link href="/logout">
          <LogOut isPlayerLogged={isPlayerLogged}>logout</LogOut>
        </Link>
      </Wrapper>
      {props.children}
    </>
  );
};

export default GlobalNav;
