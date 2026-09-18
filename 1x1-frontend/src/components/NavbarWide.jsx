import logo from "../assets/logo.png";
import "./NavbarWide.css";

function NavbarWide() {
  return (
    <header className="navbar-wide">
      <div className="navbar-wide__marca">
        <img src={logo} alt="1x1" className="navbar-wide__logo" />
        <span className="navbar-wide__tagline">Un día a la vez</span>
      </div>
    </header>
  );
}

export default NavbarWide;
