import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login          from "./pages/Login"
import SignUp         from "./pages/SignUp"
import LoadingScreen  from "./components/LoadingScreen"
import DashboardLayout from "./pages/DashboardLayout"
import Dashboard      from "./pages/Dashboard"
import CreateShipment from "./pages/CreateShipment"
import TrackShipment  from "./pages/TrackShipment"
import OrderHistory   from "./pages/OrderHistory"
import Settings       from "./pages/Settings"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/"        element={<Login />} />
        <Route path="/signup"  element={<SignUp />} />
        <Route path="/loading" element={<LoadingScreen />} />

        {/* Dashboard shell */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index                element={<Dashboard />}      />
          <Route path="create"        element={<CreateShipment />} />
          <Route path="track"         element={<TrackShipment />}  />
          <Route path="orders"        element={<OrderHistory />}   />
          <Route path="settings"      element={<Settings />}       />
        </Route>

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}