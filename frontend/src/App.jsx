import React from "react";
import Heatmap from "./components/Heatmap"

function App() {
  return (
    <div style={{textAlign: 'center'}}>
      <h3>New York Parking Violations By Precinct</h3>
      <Heatmap />
    </div>
  );
}

export default App;