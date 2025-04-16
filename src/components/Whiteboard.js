import React, { useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Rect, Text, Group } from 'react-konva';
import socket from '../socket';

const Whiteboard = () => {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]); // For rectangles and circles
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, setCursors] = useState({});
  const [stickyNotes, setStickyNotes] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [mode, setMode] = useState('draw'); // Modes: 'draw', 'erase', 'rectangle', 'circle'
  const [startPos, setStartPos] = useState(null); // For drawing shapes

  // const handleMouseDown = (e) => {
  //   const pos = e.target.getStage().getPointerPosition();
  //   if (mode === 'erase') {
  //     const stage = e.target.getStage();
  //     const target = stage.getIntersection(pos);
  //     if (target) {
  //       if (target.getClassName() === 'Line') {
  //         const lineId = target.attrs.id;
  //         setLines((prev) => prev.filter((line) => line.id !== lineId));
  //         socket.emit('erase', { type: 'line', id: lineId });
  //       } else if (target.getParent() && target.getParent().attrs.name === 'stickyNote') {
  //         const noteId = target.getParent().attrs.id;
  //         setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));
  //         socket.emit('erase', { type: 'stickyNote', id: noteId });
  //       } else if (target.getClassName() === 'Rect' && target.getParent().attrs.name !== 'stickyNote') {
  //         const shapeId = target.getParent().attrs.id;
  //         setShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
  //         socket.emit('erase', { type: 'shape', id: shapeId });
  //       }
  //     }
  //     return;
  //   }

  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    console.log('Mouse down at position:', pos); // Debug
    if (mode === 'erase') {
      const target = stage.getIntersection(pos);
      console.log('Erase mode - Intersection target:', target);
      if (target) {
        console.log('Target class:', target.getClassName(), 'Attrs:', target.attrs);
        if (target.getClassName() === 'Line') {
          const lineId = target.attrs.id;
          console.log('Erasing line with ID:', lineId);
          setLines((prev) => prev.filter((line) => line.id !== lineId));
          socket.emit('erase', { type: 'line', id: lineId });
        } else if (target.getParent() && target.getParent().attrs.name === 'stickyNote') {
          const noteId = target.getParent().attrs.id;
          console.log('Erasing sticky note with ID:', noteId);
          setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));
          socket.emit('erase', { type: 'stickyNote', id: noteId });
        } else if (target.getParent() && target.getParent().attrs.name === 'shape') {
          const shapeId = target.getParent().attrs.id;
          console.log('Erasing shape with ID:', shapeId);
          setShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
          socket.emit('erase', { type: 'shape', id: shapeId });
        } else {
          console.log('No matching element to erase');
        }
      } else {
        console.log('No element found at position:', pos);
      }
      return;
    }
  
    setIsDrawing(true);
    if (mode === 'draw') {
      const newLine = { id: `${socket.id}-${Date.now()}`, points: [pos.x, pos.y], userId: socket.id, color: selectedColor, strokeWidth: brushSize };
      setLines((prev) => [...prev, newLine]);
      console.log('Emitting draw (start):', newLine);
      socket.emit('draw', newLine);
    } else if (mode === 'rectangle' || mode === 'circle') {
      setStartPos(pos);
    }
  };

  const handleMouseMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    socket.emit('cursorMove', { x: point.x, y: point.y });

    if (!isDrawing) return;

    if (mode === 'draw') {
      const lastLine = lines[lines.length - 1];
      const updatedLine = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };
      const updatedLines = [...lines.slice(0, -1), updatedLine];
      setLines(updatedLines);
      console.log('Emitting draw (update):', updatedLine);
      socket.emit('draw', updatedLine);
    }
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);
    const pos = e.target.getStage().getPointerPosition();

    if (mode === 'draw') {
      const lastLine = lines[lines.length - 1];
      console.log('Emitting draw (end):', lastLine);
      socket.emit('draw', lastLine);
    } else if (mode === 'rectangle' || mode === 'circle') {
      if (startPos) {
        const newShape = {
          id: `${socket.id}-${Date.now()}`,
          type: mode,
          x: Math.min(startPos.x, pos.x),
          y: Math.min(startPos.y, pos.y),
          width: Math.abs(pos.x - startPos.x),
          height: Math.abs(pos.y - startPos.y),
          color: selectedColor,
          userId: socket.id,
        };
        setShapes((prev) => [...prev, newShape]);
        console.log('Emitting shape:', newShape); // Debug
        socket.emit('shape', newShape);
        setStartPos(null);
      }
    }
  };

  // const handleTouchStart = (e) => {
  //   const stage = e.target.getStage();
  //   const pos = stage.getPointerPosition();
  //   if (mode === 'erase') {
  //     const target = stage.getIntersection(pos);
  //     if (target) {
  //       if (target.getClassName() === 'Line') {
  //         const lineId = target.attrs.id;
  //         setLines((prev) => prev.filter((line) => line.id !== lineId));
  //         socket.emit('erase', { type: 'line', id: lineId });
  //       } else if (target.getParent() && target.getParent().attrs.name === 'stickyNote') {
  //         const noteId = target.getParent().attrs.id;
  //         setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));
  //         socket.emit('erase', { type: 'stickyNote', id: noteId });
  //       } else if (target.getClassName() === 'Rect' && target.getParent().attrs.name !== 'stickyNote') {
  //         const shapeId = target.getParent().attrs.id;
  //         setShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
  //         socket.emit('erase', { type: 'shape', id: shapeId });
  //       }
  //     }
  //     return;
  //   }


const handleTouchStart = (e) => {
  const stage = e.target.getStage();
  const pos = stage.getPointerPosition();
  console.log('Touch start at position:', pos); // Debug
  if (mode === 'erase') {
    const target = stage.getIntersection(pos);
    console.log('Erase mode (touch) - Intersection target:', target);
    if (target) {
      console.log('Target class (touch):', target.getClassName(), 'Attrs:', target.attrs);
      if (target.getClassName() === 'Line') {
        const lineId = target.attrs.id;
        console.log('Erasing line with ID (touch):', lineId);
        setLines((prev) => prev.filter((line) => line.id !== lineId));
        socket.emit('erase', { type: 'line', id: lineId });
      } else if (target.getParent() && target.getParent().attrs.name === 'stickyNote') {
        const noteId = target.getParent().attrs.id;
        console.log('Erasing sticky note with ID (touch):', noteId);
        setStickyNotes((prev) => prev.filter((note) => note.id !== noteId));
        socket.emit('erase', { type: 'stickyNote', id: noteId });
      } else if (target.getParent() && target.getParent().attrs.name === 'shape') {
        const shapeId = target.getParent().attrs.id;
        console.log('Erasing shape with ID (touch):', shapeId);
        setShapes((prev) => prev.filter((shape) => shape.id !== shapeId));
        socket.emit('erase', { type: 'shape', id: shapeId });
      } else {
        console.log('No matching element to erase (touch)');
      }
    } else {
      console.log('No element found at position (touch):', pos);
    }
    return;
  }

  setIsDrawing(true);
  if (mode === 'draw') {
    const newLine = { id: `${socket.id}-${Date.now()}`, points: [pos.x, pos.y], userId: socket.id, color: selectedColor, strokeWidth: brushSize };
    setLines((prev) => [...prev, newLine]);
    console.log('Emitting draw (start, touch):', newLine);
    socket.emit('draw', newLine);
  } else if (mode === 'rectangle' || mode === 'circle') {
    setStartPos(pos);
  }
};
 
  const handleTouchMove = (e) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    socket.emit('cursorMove', { x: point.x, y: point.y });

    if (!isDrawing) return;

    if (mode === 'draw') {
      const lastLine = lines[lines.length - 1];
      const updatedLine = {
        ...lastLine,
        points: lastLine.points.concat([point.x, point.y]),
      };
      const updatedLines = [...lines.slice(0, -1), updatedLine];
      setLines(updatedLines);
      console.log('Emitting draw (update, touch):', updatedLine);
      socket.emit('draw', updatedLine);
    }
  };

  const handleTouchEnd = (e) => {
    setIsDrawing(false);
    const pos = e.target.getStage().getPointerPosition();

    if (mode === 'draw') {
      const lastLine = lines[lines.length - 1];
      console.log('Emitting draw (end, touch):', lastLine);
      socket.emit('draw', lastLine);
    } else if (mode === 'rectangle' || mode === 'circle') {
      if (startPos) {
        const newShape = {
          id: `${socket.id}-${Date.now()}`,
          type: mode,
          x: Math.min(startPos.x, pos.x),
          y: Math.min(startPos.y, pos.y),
          width: Math.abs(pos.x - startPos.x),
          height: Math.abs(pos.y - startPos.y),
          color: selectedColor,
          userId: socket.id,
        };
        setShapes((prev) => [...prev, newShape]);
        console.log('Emitting shape (touch):', newShape); // Debug
        socket.emit('shape', newShape);
        setStartPos(null);
      }
    }
  };

  const addStickyNote = () => {
    const newNote = {
      id: `${socket.id}-${Date.now()}`,
      x: 100,
      y: 100,
      text: 'New Note',
      userId: socket.id,
    };
    setStickyNotes((prev) => [...prev, newNote]);
    console.log('Emitting stickyNote:', newNote); // Debug
    socket.emit('stickyNote', newNote);
  };

  const handleStickyNoteDragEnd = (e, noteId) => {
    const updatedNote = {
      id: noteId,
      x: e.target.x(),
      y: e.target.y(),
      text: stickyNotes.find((note) => note.id === noteId).text,
      userId: socket.id,
    };
    setStickyNotes((prev) => prev.map((note) => (note.id === noteId ? updatedNote : note)));
    socket.emit('stickyNoteUpdate', updatedNote);
  };

  const clearCanvas = () => {
    setLines([]);
    setShapes([]);
    setStickyNotes([]);
    socket.emit('clearCanvas');
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

    const handleShape = (data) => {
      console.log('Received shape:', data);
      setShapes((prev) => {
        const updatedShapes = [...prev, data];
        console.log('Updated shapes state:', updatedShapes);
        return updatedShapes;
      });
    };
    
    const handleStickyNote = (data) => {
      console.log('Received stickyNote:', data);
      setStickyNotes((prev) => {
        const updatedNotes = [...prev, data];
        console.log('Updated stickyNotes state:', updatedNotes);
        return updatedNotes;
      });
    };

    const handleStickyNoteUpdate = (data) => {
      console.log('Received stickyNoteUpdate:', data);
      setStickyNotes((prev) => prev.map((note) => (note.id === data.id ? data : note)));
    };

    const handleErase = (data) => {
      console.log('Received erase:', data);
      if (data.type === 'line') {
        setLines((prev) => prev.filter((line) => line.id !== data.id));
      } else if (data.type === 'stickyNote') {
        setStickyNotes((prev) => prev.filter((note) => note.id !== data.id));
      } else if (data.type === 'shape') {
        setShapes((prev) => prev.filter((shape) => shape.id !== data.id));
      }
    };

    const handleClearCanvas = () => {
      console.log('Received clearCanvas');
      setLines([]);
      setShapes([]);
      setStickyNotes([]);
    };

    socket.on('cursorUpdate', handleCursorUpdate);
    socket.on('userDisconnected', handleUserDisconnected);
    socket.on('drawUpdate', handleDrawUpdate);
    socket.on('shape', handleShape);
    socket.on('stickyNote', handleStickyNote);
    socket.on('stickyNoteUpdate', handleStickyNoteUpdate);
    socket.on('erase', handleErase);
    socket.on('clearCanvas', handleClearCanvas);

    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`, args);
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('cursorUpdate', handleCursorUpdate);
      socket.off('userDisconnected', handleUserDisconnected);
      socket.off('drawUpdate', handleDrawUpdate);
      socket.off('shape', handleShape);
      socket.off('stickyNote', handleStickyNote);
      socket.off('stickyNoteUpdate', handleStickyNoteUpdate);
      socket.off('erase', handleErase);
      socket.off('clearCanvas', handleClearCanvas);
      socket.offAny();
    };
  }, [socket]);

  return (
    <div>
      <div style={{ padding: '10px', background: '#f0f0f0', display: 'flex', gap: '10px' }}>
        <button onClick={() => setMode('draw')} style={{ background: mode === 'draw' ? '#d3d3d3' : '#fff' }}>Draw</button>
        <button onClick={() => setMode('erase')} style={{ background: mode === 'erase' ? '#d3d3d3' : '#fff' }}>Erase</button>
        <button onClick={() => setMode('rectangle')} style={{ background: mode === 'rectangle' ? '#d3d3d3' : '#fff' }}>Rectangle</button>
        <button onClick={() => setMode('circle')} style={{ background: mode === 'circle' ? '#d3d3d3' : '#fff' }}>Circle</button>
        <label>
          Color:
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
          />
        </label>
        <label>
          Brush Size:
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </label>
        <button onClick={addStickyNote}>Add Sticky Note</button>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>
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
        {/* <Layer>
          {lines.map((line, i) => (
            <Line
              key={line.id}
              id={line.id}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation="source-over"
            />
          ))}
          {shapes.map((shape) => (
            <Group key={shape.id} id={shape.id}>
              {shape.type === 'rectangle' ? (
                <Rect
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.color}
                  strokeWidth={2}
                />
              ) : (
                <Circle
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radius={Math.min(shape.width, shape.height) / 2}
                  stroke={shape.color}
                  strokeWidth={2}
                />
              )}
            </Group>
          ))}
          {stickyNotes.map((note) => (
            <Group
              key={note.id}
              id={note.id}
              name="stickyNote"
              x={note.x}
              y={note.y}
              draggable
              onDragEnd={(e) => handleStickyNoteDragEnd(e, note.id)}
            >
              <Rect
                width={100}
                height={60}
                fill="yellow"
                shadowColor="black"
                shadowBlur={5}
                shadowOffset={{ x: 2, y: 2 }}
                shadowOpacity={0.3}
              />
              <Text
                text={note.text}
                fontSize={14}
                padding={5}
                width={100}
                height={60}
                align="center"
                verticalAlign="middle"
              />
            </Group>
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
        </Layer> */}

<Layer listening={true}>
  {lines.map((line, i) => (
    <Line
      key={line.id}
      id={line.id}
      points={line.points}
      stroke={line.color}
      strokeWidth={line.strokeWidth}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation="source-over"
      listening={true} // Ensure the line can be detected
    />
  ))}
  {shapes.map((shape) => (
    <Group key={shape.id} id={shape.id} name="shape" listening={true}>
      {shape.type === 'rectangle' ? (
        <Rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          stroke={shape.color}
          strokeWidth={2}
          listening={true}
        />
      ) : (
        <Circle
          x={shape.x + shape.width / 2}
          y={shape.y + shape.height / 2}
          radius={Math.min(shape.width, shape.height) / 2}
          stroke={shape.color}
          strokeWidth={2}
          listening={true}
        />
      )}
    </Group>
  ))}
  {stickyNotes.map((note) => (
    <Group
      key={note.id}
      id={note.id}
      name="stickyNote"
      x={note.x}
      y={note.y}
      draggable
      onDragEnd={(e) => handleStickyNoteDragEnd(e, note.id)}
      listening={true}
    >
      <Rect
        width={100}
        height={60}
        fill="yellow"
        shadowColor="black"
        shadowBlur={5}
        shadowOffset={{ x: 2, y: 2 }}
        shadowOpacity={0.3}
        listening={true}
      />
      <Text
        text={note.text}
        fontSize={14}
        padding={5}
        width={100}
        height={60}
        align="center"
        verticalAlign="middle"
        listening={false} // Text doesn’t need to be clickable
      />
    </Group>
  ))}
  {Object.entries(cursors).map(([userId, pos]) => (
    <Circle
      key={userId}
      x={pos.x}
      y={pos.y}
      radius={5}
      fill="red"
      opacity={0.8}
      listening={false} // Cursors shouldn’t intercept clicks
    />
  ))}
</Layer>
      </Stage>
    </div>
  );
};

export default Whiteboard;