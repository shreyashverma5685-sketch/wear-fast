import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/wardrobe">My Wardrobe</NavLink>
      <NavLink to="/suggestions">Suggestions</NavLink>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/signup">Sign Up</NavLink>
    </nav>
  );
}

export default Navbar;