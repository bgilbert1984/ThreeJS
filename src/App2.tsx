// src/App.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Nodes, Node } from './components/Nodes';

function App() {
  const [nodesData, setNodesData] = useState<any[]>([]); // Store node data here.
  const nodeRefs = useRef<any[]>([]); // Array to hold node refs.

  //Simulate fetching time-series data from a server
  useEffect(() => {
      const generateData = () => {
          const newData = [];
            for (let i = 0; i < 5; i++) {
                newData.push({
                  name: String.fromCharCode(97 + i), // a, b, c, d, e
                  color: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
                  position: [Math.random() * 6 - 3, Math.random() * 6 - 3, 0], // Random position
                  connectedTo: [], // Initialize empty, we'll set connections later
                });
            }

             // Set connections randomly (for demonstration)
            newData.forEach((node, index) => {
                if (index > 0) {
                    node.connectedTo.push(index -1); // Connect to the previous node.
                }
                if(index < newData.length - 1){
                    node.connectedTo.push(index + 1);
                }
            });

            return newData;
        };

    const intervalId = setInterval(() => {
      const newData = generateData();
      setNodesData(newData);
      //Update Refs
      newData.forEach((nodeData, index) => {
        if(nodeRefs.current[index]){
            nodeRefs.current[index].current.updatePosition(nodeData.position);
            nodeRefs.current[index].current.updateColor(nodeData.color);
        }
      });

    }, 2000); // Update every 2 seconds


    return () => clearInterval(intervalId);
  }, []);

    //Create Ref array
    useEffect(() => {
        nodeRefs.current = nodesData.map((_, i) => nodeRefs.current[i] || React.createRef());
    }, [nodesData]);



  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas orthographic camera={{ zoom: 80 }}>
          <OrbitControls />
        <Nodes>
          {nodesData.map((node, index) => (
            <Node
              key={node.name}
              ref={nodeRefs.current[index]}
              name={node.name}
              color={node.color}
              position={node.position}
              connectedTo={node.connectedTo.map(targetIndex => nodeRefs.current[targetIndex])}
            />
          ))}
        </Nodes>
      </Canvas>
    </div>
  );
}

export default App;