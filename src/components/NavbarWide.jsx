import logo from "../assets/logo.png";
import "./NavbarWide.css";

function NavbarWide() {
  return (
    <header className="navbar-wide">
      <img src={logo} alt="1x1" className="navbar-wide__logo" />
      <p className="navbar-wide__tagline">Un día a la vez</p>
    </header>
  );
}

export default NavbarWide;
