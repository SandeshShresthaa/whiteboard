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
    const newLine = { points: [pos.x, pos.y], userId: socket.id };
    setLines([...lines, newLine]);
    console.log('Emitting draw (start):', { type: 'start', points: [pos.x, pos.y] }); // Debug
    socket.emit('draw', { type: 'start', points: [pos.x, pos.y] }); // Emit start of line
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
    socket.emit('draw', { type: 'update', points: [point.x, point.y] }); // Emit updated points
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    console.log('Emitting draw (end)'); // Debug
    socket.emit('draw', { type: 'end' }); // Emit end of line
  };

  // Touch event handlers (already added)
//   const handleTouchStart = (e) => {
//     const touch = e.evt.touches[0];
//     const pos = { x: touch.clientX, y: touch.clientY };
//     setIsDrawing(true);
//     const newLine = { points: [pos.x, pos.y], userId: socket.id };
//     setLines([...lines, newLine]);
//     console.log('Emitting draw (start, touch):', { type: 'start', points: [pos.x, pos.y] }); // Debug
//     socket.emit('draw', { type: 'start', points: [pos.x, pos.y] });
//   };

//   const handleTouchMove = (e) => {
//     const touch = e.evt.touches[0];
//     const point = { x: touch.clientX, y: touch.clientY };
//     socket.emit('cursorMove', { x: point.x, y: point.y });

//     if (!isDrawing) return;
//     const lastLine = lines[lines.length - 1];
//     const updatedLine = {
//       ...lastLine,
//       points: lastLine.points.concat([point.x, point.y]),
//     };
//     const updatedLines = [...lines.slice(0, -1), updatedLine];
//   setLines(updatedLines);
//   console.log('Emitting draw (update, touch):', { type: 'update', points: [point.x, point.y] }); // Debug
//   socket.emit('draw', { type: 'update', points: [point.x, point.y] });
// };





const handleTouchStart = (e) => {
    const stage = e.target.getStage();
    const touch = e.evt.touches[0];
    const pos = stage.getPointerPosition(); // Use Konva's pointer position
    setIsDrawing(true);
    const newLine = { points: [pos.x, pos.y], userId: socket.id };
    setLines([...lines, newLine]);
    console.log('Emitting draw (start, touch):', { type: 'start', points: [pos.x, pos.y] });
    socket.emit('draw', { type: 'start', points: [pos.x, pos.y] });
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
    console.log('Emitting draw (update, touch):', { type: 'update', points: [point.x, point.y] });
    socket.emit('draw', { type: 'update', points: [point.x, point.y] });
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    console.log('Emitting draw (end, touch)'); // Debug
    socket.emit('draw', { type: 'end' });
  };

  useEffect(() => {
    socket.on('cursorUpdate', (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y },
      }));
    });

    socket.on('userDisconnected', (userId) => {
      setCursors((prev) => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    });

    // Handle incoming drawing updates
    socket.on('drawUpdate', (data) => {
        console.log('Received drawUpdate:', data); // Debug
      if (data.type === 'start') {
        setLines((prev) => [...prev, { points: data.points, userId: data.userId }]);
      } else if (data.type === 'update') {
        setLines((prev) => {
          const lastLine = prev.find((line) => line.userId === data.userId && line.points.length >= 2);
          if (!lastLine) return prev;
          const updatedLine = {
            ...lastLine,
            points: lastLine.points.concat(data.points),
          };
          return [...prev.filter((line) => line !== lastLine), updatedLine];
        });
      } else if (data.type === 'end') {
        // No action needed for 'end' in this case
      }
    });

    return () => {
      socket.off('cursorUpdate');
      socket.off('userDisconnected');
      socket.off('drawUpdate');
    };
  }, []);

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
        {lines.map((line, i) => (
          <Line
            key={i}
            points={line.points}
            stroke="#000"
            strokeWidth={2}
            tension={0.5}
            lineCap="round"
            globalCompositeOperation="source-over"
          />
        ))}
        {Object.entries(cursors).map(([userId, pos]) => (
          <Circle
            key={userId}
            x={pos.x}
            y={pos.y}
            radius={5}
            fill="red"
            opacity={0.8}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default Whiteboard;