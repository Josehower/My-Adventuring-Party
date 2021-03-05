import { useRouter } from 'next/router';
import Link from 'next/link';
import styled from 'styled-components';

const SideBar = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  justify-items: center;
  background: rgb(48, 39, 223);
  background: linear-gradient(
    180deg,
    rgba(48, 39, 223, 1) 0%,
    rgba(4, 0, 94, 1) 75%
  );
  color: #eeeeee;
  border-radius: 5px;
  border: 2px solid white;
  font-family: 'VT323', monospace;
  height: 1.3em;
  font-size: 1.5em;
  margin: 10px;
  overflow: visible;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  line-height: -20px;
  margin: -10px;
  cursor: pointer;
  user-select: none;

  &:hover {
    text-decoration: underline;
  }

  &::before {
    background-image: url('sword.png');
    background-repeat: no-repeat;
    background-size: 30px 30px;
    display: inline-block;
    width: 30px;
    height: 30px;
    content: '';
    position: relative;
    top: 10px;
    visibility: ${(props) => (props.isActive ? 'visible' : 'hidden')};
  }
`;

const GameNav = ({ loggedIn }) => {
  const router = useRouter();

  if (!loggedIn) {
    return '';
  }
  return (
    <SideBar>
      <Link href="/">
        <NavLink isActive={router.route === '/' ? true : false}>Home</NavLink>
      </Link>
      <Link href="/expeditions">
        <NavLink isActive={router.route === '/expeditions' ? true : false}>
          expeditions
        </NavLink>
      </Link>
      <Link href="/helden">
        <NavLink isActive={router.route === '/helden' ? true : false}>
          helden
        </NavLink>
      </Link>
      <Link href="/store">
        <NavLink isActive={router.route === '/store' ? true : false}>
          store
        </NavLink>
      </Link>
      <Link href="/story-mode">
        <NavLink isActive={router.route === '/story-mode' ? true : false}>
          story mode
        </NavLink>
      </Link>
    </SideBar>
  );
};

export default GameNav;
