import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/create">Create Invoice</Link>
      <Link to="/thankyou">Thank You</Link>
    </nav>
  );
}

export default Navbar;
