import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Dashboard } from './components';
import './App.css';
import { DashboardProvider } from './context';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="dashboard"
            element={
              <DashboardProvider>
                <Dashboard />
              </DashboardProvider>} />
          {/* <Route path="*" element={<NoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
