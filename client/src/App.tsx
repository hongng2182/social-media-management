import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Dashboard } from './components';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* <Route path="*" element={<NoPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
