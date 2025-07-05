import { useEffect, useRef, useState, useCallback } from "react";
import { X, Download, Trash2, Undo2, Redo2, Save, MousePointer, Type, Palette } from "lucide-react";

export default function Whiteboard({ isOpen, onClose, socket, roomId, isHost }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // pen, eraser, text
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [isTextMode, setIsTextMode] = useState(false);
  const [collaborators, setCollaborators] = useState(new Map());
  const [whiteboardRoomId] = useState(`whiteboard-${roomId}`);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000"
  ];

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set initial context properties
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.fillStyle = color;
    
    contextRef.current = context;

    // Set up socket listeners for whiteboard collaboration
    if (socket) {
      socket.on("whiteboard_draw", handleRemoteDraw);
      socket.on("whiteboard_clear", handleRemoteClear);
      socket.on("whiteboard_undo", handleRemoteUndo);
      socket.on("whiteboard_redo", handleRemoteRedo);
      socket.on("whiteboard_collaborator_join", handleCollaboratorJoin);
      socket.on("whiteboard_collaborator_leave", handleCollaboratorLeave);
    }

    // Join the whiteboard room
    if (socket && isOpen) {
      socket.emit("whiteboard_collaborator_join", {
        roomId: whiteboardRoomId,
        userId: socket.id,
        username: "User"
      });
    }

    return () => {
      if (socket) {
        socket.off("whiteboard_draw", handleRemoteDraw);
        socket.off("whiteboard_clear", handleRemoteClear);
        socket.off("whiteboard_undo", handleRemoteUndo);
        socket.off("whiteboard_redo", handleRemoteRedo);
        socket.off("whiteboard_collaborator_join", handleCollaboratorJoin);
        socket.off("whiteboard_collaborator_leave", handleCollaboratorLeave);
        
        // Leave the whiteboard room
        socket.emit("whiteboard_collaborator_leave", {
          roomId: whiteboardRoomId,
          userId: socket.id
        });
      }
    };
  }, [isOpen, socket, whiteboardRoomId]);

  const handleRemoteDraw = useCallback((data) => {
    if (!contextRef.current) return;
    
    const { x, y, type, color: remoteColor, size } = data;
    const context = contextRef.current;
    
    if (type === "start") {
      context.beginPath();
      context.moveTo(x, y);
    } else if (type === "draw") {
      context.strokeStyle = remoteColor;
      context.lineWidth = size;
      context.lineTo(x, y);
      context.stroke();
    }
  }, []);

  const handleRemoteClear = useCallback(() => {
    if (!contextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleRemoteUndo = useCallback(() => {
    // Handle remote undo
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, lastState]);
      // Restore canvas state
      if (contextRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // You could implement more sophisticated state restoration here
      }
    }
  }, [undoStack]);

  const handleRemoteRedo = useCallback(() => {
    // Handle remote redo
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, nextState]);
      // Restore canvas state
      if (contextRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        // You could implement more sophisticated state restoration here
      }
    }
  }, [redoStack]);

  const handleCollaboratorJoin = useCallback((data) => {
    const { userId, username } = data;
    setCollaborators(prev => new Map(prev.set(userId, { username })));
  }, []);

  const handleCollaboratorLeave = useCallback((data) => {
    const { userId } = data;
    setCollaborators(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  const startDrawing = (e) => {
    if (isTextMode) return;
    
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    const context = contextRef.current;
    
    // Set drawing properties at the start
    if (tool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = brushSize * 2;
    } else {
      context.globalCompositeOperation = "source-over";
      context.lineWidth = brushSize;
      context.strokeStyle = color;
    }
    
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    
    // Save state for undo
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack(prev => [...prev, imageData]);
      setRedoStack([]); // Clear redo stack when new action is performed
    }
    
    // Emit drawing start to other users
    if (socket) {
      socket.emit("whiteboard_draw", {
        roomId: whiteboardRoomId,
        x: offsetX,
        y: offsetY,
        type: "start",
        color,
        size: brushSize
      });
    }
  };

  const draw = (e) => {
    if (!isDrawing || isTextMode) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const context = contextRef.current;
    
    context.lineTo(offsetX, offsetY);
    context.stroke();
    
    // Emit drawing to other users
    if (socket) {
      socket.emit("whiteboard_draw", {
        roomId: whiteboardRoomId,
        x: offsetX,
        y: offsetY,
        type: "draw",
        color: tool === "eraser" ? "#ffffff" : color,
        size: tool === "eraser" ? brushSize * 2 : brushSize
      });
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addText = (e) => {
    if (!isTextMode || !contextRef.current) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    const text = prompt("Enter text:");
    if (!text) return;
    
    const context = contextRef.current;
    context.font = `${brushSize * 8}px Arial`;
    context.fillStyle = color;
    context.fillText(text, offsetX, offsetY);
    
    // Emit text to other users
    if (socket) {
      socket.emit("whiteboard_draw", {
        roomId: whiteboardRoomId,
        x: offsetX,
        y: offsetY,
        type: "text",
        text,
        color,
        size: brushSize
      });
    }
  };

  const undo = () => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setUndoStack(prev => prev.slice(0, -1));
      setRedoStack(prev => [...prev, lastState]);
      
      if (contextRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.putImageData(lastState, 0, 0);
      }
      
      // Emit undo to other users
      if (socket) {
        socket.emit("whiteboard_undo", { roomId: whiteboardRoomId });
      }
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setRedoStack(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, nextState]);
      
      if (contextRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.putImageData(nextState, 0, 0);
      }
      
      // Emit redo to other users
      if (socket) {
        socket.emit("whiteboard_redo", { roomId: whiteboardRoomId });
      }
    }
  };

  const exportAsPNG = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const exportAsSVG = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", canvas.width);
    svg.setAttribute("height", canvas.height);
    
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("href", canvas.toDataURL());
    image.setAttribute("width", canvas.width);
    image.setAttribute("height", canvas.height);
    
    svg.appendChild(image);
    
    const link = document.createElement("a");
    link.download = `whiteboard-${Date.now()}.svg`;
    link.href = URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml" }));
    link.click();
  };

  const clearCanvas = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Emit clear to other users
    if (socket) {
      socket.emit("whiteboard_clear", { roomId: whiteboardRoomId });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
          <h2 className="text-xl font-semibold text-white">🧑‍🏫 Collaborative Whiteboard</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAsPNG}
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Export as PNG"
            >
              <Download size={20} />
            </button>
            <button
              onClick={exportAsSVG}
              className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Export as SVG"
            >
              <Save size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              title="Clear Canvas"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Collaborators Info */}
        {collaborators.size > 0 && (
          <div className="px-4 py-2 bg-blue-50 border-b">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>Collaborators:</span>
              {Array.from(collaborators.values()).map((collaborator, index) => (
                <span key={index} className="bg-blue-200 px-2 py-1 rounded">
                  {collaborator.username}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b bg-gradient-to-r from-yellow-100 to-orange-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTool("pen")}
              className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg ${
                tool === "pen" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl" 
                  : "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
              }`}
              title="Pen Tool"
            >
              <MousePointer size={24} />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg ${
                tool === "eraser" 
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl" 
                  : "bg-gradient-to-r from-pink-400 to-pink-500 hover:from-pink-500 hover:to-pink-600 text-white"
              }`}
              title="Eraser"
            >
              <Trash2 size={24} />
            </button>
            <button
              onClick={() => setIsTextMode(!isTextMode)}
              className={`p-3 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg ${
                isTextMode 
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl" 
                  : "bg-gradient-to-r from-indigo-400 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white"
              }`}
              title="Text Tool"
            >
              <Type size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-lg">
            <span className="text-sm font-bold text-gray-700">🎨 Color:</span>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-4 transition-all duration-200 transform hover:scale-125 ${
                    color === c ? "border-gray-800 shadow-lg" : "border-gray-300 hover:border-gray-500"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-lg">
            <span className="text-sm font-bold text-gray-700">📏 Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="text-sm font-bold w-8 text-center bg-blue-100 px-2 py-1 rounded">{brushSize}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className="p-3 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              title="Undo"
            >
              <Undo2 size={24} />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="p-3 bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
              title="Redo"
            >
              <Redo2 size={24} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={isTextMode ? addText : undefined}
            className="w-full h-full cursor-crosshair border border-gray-200"
            style={{ cursor: isTextMode ? "text" : "crosshair" }}
          />
        </div>
      </div>
    </div>
  );
} 