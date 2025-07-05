import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:id" element={<Room />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
