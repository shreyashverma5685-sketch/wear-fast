import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>
        Home
      </NavLink>
      <NavLink to="/wardrobe">
        My Wardrobe
      </NavLink>
      <NavLink to="/suggestions">
        Suggestions
      </NavLink>
    </nav>
  );
}

export default Navbar;