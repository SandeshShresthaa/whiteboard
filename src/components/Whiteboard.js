// import React, { useState, useEffect } from 'react';
// import { Stage, Layer, Line, Circle } from 'react-konva';
// import socket from '../socket';

// const Whiteboard = () => {
//   const [lines, setLines] = useState([]);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [cursors, setCursors] = useState({});

//   const handleMouseDown = (e) => {
//     setIsDrawing(true);
//     const pos = e.target.getStage().getPointerPosition();
//     const newLine = { points: [pos.x, pos.y], userId: socket.id };
//     setLines([...lines, newLine]);
//     console.log('Emitting draw (start):', newLine);
//     socket.emit('draw', newLine);
//   };

//   const handleMouseMove = (e) => {
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();

//     socket.emit('cursorMove', { x: point.x, y: point.y });

//     if (!isDrawing) return;
//     const lastLine = lines[lines.length - 1];
//     const updatedLine = {
//       ...lastLine,
//       points: lastLine.points.concat([point.x, point.y]),
//     };
//     const updatedLines = [...lines.slice(0, -1), updatedLine];
//     setLines(updatedLines);
//     console.log('Emitting draw (update):', updatedLine);
//     socket.emit('draw', updatedLine);
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     const lastLine = lines[lines.length - 1];
//     console.log('Emitting draw (end):', lastLine);
//     socket.emit('draw', lastLine);
//   };

//   const handleTouchStart = (e) => {
//     const stage = e.target.getStage();
//     const pos = stage.getPointerPosition();
//     setIsDrawing(true);
//     const newLine = { points: [pos.x, pos.y], userId: socket.id };
//     setLines([...lines, newLine]);
//     console.log('Emitting draw (start, touch):', newLine);
//     socket.emit('draw', newLine);
//   };

//   const handleTouchMove = (e) => {
//     const stage = e.target.getStage();
//     const point = stage.getPointerPosition();
//     socket.emit('cursorMove', { x: point.x, y: point.y });

//     if (!isDrawing) return;
//     const lastLine = lines[lines.length - 1];
//     const updatedLine = {
//       ...lastLine,
//       points: lastLine.points.concat([point.x, point.y]),
//     };
//     const updatedLines = [...lines.slice(0, -1), updatedLine];
//     setLines(updatedLines);
//     console.log('Emitting draw (update, touch):', updatedLine);
//     socket.emit('draw', updatedLine);
//   };

//   const handleTouchEnd = () => {
//     setIsDrawing(false);
//     const lastLine = lines[lines.length - 1];
//     console.log('Emitting draw (end, touch):', lastLine);
//     socket.emit('draw', lastLine);
//   };

//   useEffect(() => {
//     console.log('Setting up socket listeners for user:', socket.id);
  
//     const handleCursorUpdate = (data) => {
//       console.log('Received cursorUpdate:', data);
//       setCursors((prev) => {
//         const updatedCursors = {
//           ...prev,
//           [data.userId]: { x: data.x, y: data.y },
//         };
//         console.log('Updated cursors state:', updatedCursors); // Debug state update
//         return updatedCursors;
//       });
//     };
  
//     const handleUserDisconnected = (userId) => {
//       console.log('Received userDisconnected:', userId);
//       setCursors((prev) => {
//         const newCursors = { ...prev };
//         delete newCursors[userId];
//         console.log('Updated cursors after disconnect:', newCursors);
//         return newCursors;
//       });
//     };
  
//     const handleDrawUpdate = (data) => {
//       console.log('Received drawUpdate:', data);
//       setLines((prev) => {
//         const existingLine = prev.find((line) => line.userId === data.userId);
//         let updatedLines;
//         if (existingLine) {
//           updatedLines = [...prev.filter((line) => line !== existingLine), data];
//         } else {
//           updatedLines = [...prev, data];
//         }
//         console.log('Updated lines state:', updatedLines); // Debug state update
//         return updatedLines;
//       });
//     };
  
//     socket.on('cursorUpdate', handleCursorUpdate);
//     socket.on('userDisconnected', handleUserDisconnected);
//     socket.on('drawUpdate', handleDrawUpdate);
  
//     // Log all incoming events for debugging
//     socket.onAny((event, ...args) => {
//       console.log(`Received event: ${event}`, args);
//     });
  
//     return () => {
//       console.log('Cleaning up socket listeners');
//       socket.off('cursorUpdate', handleCursorUpdate);
//       socket.off('userDisconnected', handleUserDisconnected);
//       socket.off('drawUpdate', handleDrawUpdate);
//       socket.offAny();
//     };
//   }, [socket]);
//   return (
//     <Stage
//       width={window.innerWidth}
//       height={window.innerHeight - 100}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onTouchStart={handleTouchStart}
//       onTouchMove={handleTouchMove}
//       onTouchEnd={handleTouchEnd}
//       style={{ border: '1px solid black' }}
//     >
//       <Layer>
//         {lines.map((line, i) => {
//           console.log('Rendering line:', i, line); // Debug rendering
//           return (
//             <Line
//               key={`${line.userId}-${i}`}
//               points={line.points}
//               stroke="#000"
//               strokeWidth={2}
//               tension={0.5}
//               lineCap="round"
//               globalCompositeOperation="source-over"
//             />
//           );
//         })}
//         {Object.entries(cursors).map(([userId, pos]) => {
//           console.log('Rendering cursor:', userId, pos); // Debug rendering
//           return (
//             <Circle
//               key={userId}
//               x={pos.x}
//               y={pos.y}
//               radius={5}
//               fill="red"
//               opacity={0.8}
//             />
//           );
//         })}
//       </Layer>
//     </Stage>
//   );
// };

// export default Whiteboard;

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle } from 'react-konva';
import socket from '../socket';

const Whiteboard = () => {
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, setCursors] = useState({});

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const newLine = { id: `${socket.id}-${Date.now()}`, points: [pos.x, pos.y], userId: socket.id };
    setLines((prev) => [...prev, newLine]);
    console.log('Emitting draw (start):', newLine);
    socket.emit('draw', newLine);
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    socket.emit('cursorMove', { x: point.x, y: point.y });

    if (!isDrawing) return;
    const lastLine = lines[lines.length - 1];
    const updatedLine = {
      ...lastLine,
      points: lastLine.points.concat([point.x, point.y]),
    };
    const updatedLines = [...lines.slice(0, -1), updatedLine];
    setLines(updatedLines);
    console.log('Emitting draw (update):', updatedLine);
    socket.emit('draw', updatedLine);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    const lastLine = lines[lines.length - 1];
    console.log('Emitting draw (end):', lastLine);
    socket.emit('draw', lastLine);
  };

  const handleTouchStart = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    setIsDrawing(true);
    const newLine = { id: `${socket.id}-${Date.now()}`, points: [pos.x, pos.y], userId: socket.id };
    setLines((prev) => [...prev, newLine]);
    console.log('Emitting draw (start, touch):', newLine);
    socket.emit('draw', newLine);
  };

  const handleTouchMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    socket.emit('cursorMove', { x: point.x, y: point.y });

    if (!isDrawing) return;
    const lastLine = lines[lines.length - 1];
    const updatedLine = {
      ...lastLine,
      points: lastLine.points.concat([point.x, point.y]),
    };
    const updatedLines = [...lines.slice(0, -1), updatedLine];
    setLines(updatedLines);
    console.log('Emitting draw (update, touch):', updatedLine);
    socket.emit('draw', updatedLine);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    const lastLine = lines[lines.length - 1];
    console.log('Emitting draw (end, touch):', lastLine);
    socket.emit('draw', lastLine);
  };

  useEffect(() => {
    console.log('Setting up socket listeners for user:', socket.id);

    const handleCursorUpdate = (data) => {
      console.log('Received cursorUpdate:', data);
      setCursors((prev) => {
        const updatedCursors = {
          ...prev,
          [data.userId]: { x: data.x, y: data.y },
        };
        console.log('Updated cursors state:', updatedCursors);
        return updatedCursors;
      });
    };

    const handleUserDisconnected = (userId) => {
      console.log('Received userDisconnected:', userId);
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        console.log('Updated cursors after disconnect:', newCursors);
        return newCursors;
      });
    };

    const handleDrawUpdate = (data) => {
      console.log('Received drawUpdate:', data);
      setLines((prev) => {
        const existingLine = prev.find((line) => line.id === data.id);
        let updatedLines;
        if (existingLine) {
          updatedLines = [...prev.filter((line) => line !== existingLine), data];
        } else {
          updatedLines = [...prev, data];
        }
        console.log('Updated lines state:', updatedLines);
        return updatedLines;
      });
    };

    socket.on('cursorUpdate', handleCursorUpdate);
    socket.on('userDisconnected', handleUserDisconnected);
    socket.on('drawUpdate', handleDrawUpdate);

    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, args);
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('cursorUpdate', handleCursorUpdate);
      socket.off('userDisconnected', handleUserDisconnected);
      socket.off('drawUpdate', handleDrawUpdate);
      socket.offAny();
    };
  }, [socket]);

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight - 100}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ border: '1px solid black' }}
    >
      <Layer>
        {lines.map((line, i) => {
          console.log('Rendering line:', i, line);
          return (
            <Line
              key={line.id}
              points={line.points}
              stroke="#000"
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          );
        })}
        {Object.entries(cursors).map(([userId, pos]) => {
          console.log('Rendering cursor:', userId, pos);
          return (
            <Circle
              key={userId}
              x={pos.x}
              y={pos.y}
              radius={5}
              fill="red"
              opacity={0.8}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default Whiteboard;