import React from 'react';
import './App.css';
// import Whiteboard from './components/Whiteboard';
import Whiteboard from './components/Whiteboard.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Scrum Whiteboard</h1>
      </header>
      <Whiteboard />
    </div>
  );
}

export default App;