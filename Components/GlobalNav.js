import styled from 'styled-components';
import Link from 'next/link';

const LogOut = styled.a`
  cursor: pointer;
  border: black 1px solid;
  visibility: ${(props) => (props.isPlayerLogged ? 'visible' : 'hidden')};
`;

export default function GlobalNav(props) {
  const isPlayerLogged = props.children.props.loggedIn;
  return (
    <>
      <div>
        <h1> My adventuring party</h1>
        <Link href="/logout">
          <LogOut isPlayerLogged={isPlayerLogged}>logout</LogOut>
        </Link>
      </div>
      {props.children}
    </>
  );
}
