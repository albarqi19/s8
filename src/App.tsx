import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminPanel } from './components/AdminPanel';
import Display from './components/Display';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Display />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;