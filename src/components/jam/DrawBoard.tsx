import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRTM } from '@/providers/RTMProvider';
import { DrawPoint, DrawStroke, DrawingState, COLORS, DrawingColor } from '@/types/drawing';
import { Pencil, Eraser, X } from 'lucide-react';

interface DrawBoardProps {
  roomId: string;
  userId: string;
  userName: string;
  isVisible: boolean;
  onClose: () => void;
}

const DrawBoard: React.FC<DrawBoardProps> = ({
  roomId,
  userId,
  userName,
  isVisible,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rtm = useRTM();
  const [state, setState] = useState<DrawingState>({
    isDrawing: false,
    currentColor: COLORS.BLACK,
    currentTool: 'pencil',
    points: [],
    lastSentTimestamp: 0,
    strokeBuffer: [],
    isVisible,
  });

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match its displayed size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      // Get the parent's actual dimensions
      const rect = parent.getBoundingClientRect();
      
      // Set canvas dimensions to match parent with correct pixelRatio
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      
      // Scale the canvas to adjust for high DPI screens
      ctx.scale(pixelRatio, pixelRatio);
      
      // Set CSS dimensions explicitly
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      console.log(`Canvas resized to ${canvas.width}x${canvas.height}, styleWidth: ${canvas.style.width}`);
      
      // Redraw strokes after resize
      fetchStrokes();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [roomId]);

  // Drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate position based on the canvas's actual rendered position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log(`Mouse down at (${x}, ${y}), canvas rect: `, rect);

    // Set up context for drawing
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = state.currentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
    }

    setState(prev => ({
      ...prev,
      isDrawing: true,
      points: [{ x, y, color: prev.currentColor, timestamp: Date.now() }],
      strokeBuffer: [{ x, y, color: prev.currentColor, timestamp: Date.now() }],
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPoint: DrawPoint = {
      x,
      y,
      color: state.currentColor,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      points: [...prev.points, newPoint],
      strokeBuffer: [...prev.strokeBuffer, newPoint],
    }));

    // Draw line to this point
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!state.isDrawing) return;
    
    e.preventDefault(); // Prevent any ghost events
    
    // Immediately set isDrawing to false to stop any additional drawing
    setState(prev => ({
      ...prev,
      isDrawing: false,
    }));
    
    // If stroke is too short, don't save it
    if (state.strokeBuffer.length < 2) {
      setState(prev => ({
        ...prev,
        strokeBuffer: [],
      }));
      return;
    }

    const stroke: DrawStroke = {
      id: crypto.randomUUID(),
      roomId,
      userId,
      userName,
      points: state.strokeBuffer,
      color: state.currentColor,
      tool: state.currentTool,
      startTime: state.strokeBuffer[0].timestamp,
      endTime: Date.now(),
    };

    // Send stroke via RTM
    try {
      const messageData = {
        type: 'DRAW',
        stroke,
        senderId: userId,
        timestamp: new Date().toISOString()
      };

      // Send to RTM channel
      await rtm.client?.publish(roomId, JSON.stringify(messageData));

      // Save stroke to database
      await fetch(`/api/jam/rooms/${roomId}/drawing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stroke }),
      });
    } catch (error) {
      console.error('Failed to send stroke:', error);
    }

    // Clear the buffer after sending
    setState(prev => ({
      ...prev,
      strokeBuffer: [],
    }));
  };

  // Handle incoming strokes from other users
  const handleIncomingStroke = useCallback((message: any) => {
    try {
      console.log("Processing message:", message);
      const parsedMessage = JSON.parse(message);
      console.log("Parsed message:", parsedMessage);
      
      if (parsedMessage.type === 'DRAW' && parsedMessage.stroke) {
        const stroke = parsedMessage.stroke;
        
        // Skip if it's our own stroke (already drawn locally)
        if (stroke.userId === userId) {
          console.log("Skipping own stroke");
          return;
        }

        console.log("Drawing stroke from user:", stroke.userId, stroke);
        
        // Draw the stroke on the canvas
        if (canvasRef.current && stroke.points && stroke.points.length > 0) {
          const ctx = canvasRef.current.getContext('2d');
          if (!ctx) return;

          // Set up the stroke style
          ctx.strokeStyle = stroke.color || '#000000';
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Draw the stroke
          ctx.beginPath();
          
          // Start at first point
          if (stroke.points[0]) {
            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          }
          
          // Connect all points
          for (let i = 1; i < stroke.points.length; i++) {
            const point = stroke.points[i];
            if (point && typeof point.x === 'number' && typeof point.y === 'number') {
              ctx.lineTo(point.x, point.y);
            }
          }
          
          ctx.stroke();
          console.log("Stroke rendered successfully");
        } else {
          console.warn("Cannot render stroke: canvas or points missing", 
            { hasCanvas: !!canvasRef.current, hasPoints: !!stroke.points, pointsLength: stroke.points?.length });
        }
      }
    } catch (error) {
      console.error('Error handling incoming stroke:', error);
    }
  }, [userId]);

  // Set up RTM message listener
  useEffect(() => {
    const handleChannelMessage = (event: any) => {
      if (typeof event.message === 'string') {
        handleIncomingStroke(event.message);
      }
    };

    if (rtm.client) {
      console.log("Setting up RTM message listener");
      rtm.client.addEventListener('message', handleChannelMessage);
    }

    return () => {
      if (rtm.client) {
        console.log("Removing RTM message listener");
        rtm.client.removeEventListener('message', handleChannelMessage);
      }
    };
  }, [rtm.client, handleIncomingStroke]);

  // Fix for drawing on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make sure our drawing actually works by setting the context properly
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;
    }
  }, [canvasRef.current]);

  // Fetch existing strokes
  const fetchStrokes = async () => {
    try {
      const response = await fetch(`/api/jam/rooms/${roomId}/drawing`);
      if (!response.ok) {
        throw new Error(`Failed to fetch strokes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched strokes data:", data);
      
      const strokes = data.strokes || [];
      console.log(`Found ${strokes.length} strokes to render`);
      
      if (strokes.length === 0) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        console.warn("Canvas not available for rendering saved strokes");
        return;
      }

      // Render each stroke
      strokes.forEach((stroke: any) => {
        try {
          // Ensure we have valid points data
          if (!stroke.points || !Array.isArray(stroke.points) || stroke.points.length < 2) {
            console.warn("Invalid stroke points data:", stroke);
            return;
          }
          
          // Extract point data, handling potential DynamoDB format differences
          const points = stroke.points.map((point: any) => {
            // Handle DynamoDB nested format if present
            if (point.M) {
              return {
                x: Number(point.M.x.N),
                y: Number(point.M.y.N),
                color: point.M.color.S,
                timestamp: Number(point.M.timestamp.N)
              };
            }
            // Otherwise use direct format
            return point;
          });
          
          console.log(`Rendering stroke with ${points.length} points`);
          
          // Set up the stroke style
          ctx.strokeStyle = stroke.color || "#000000";
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Draw the stroke
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          
          for (let i = 1; i < points.length; i++) {
            if (typeof points[i].x === 'number' && typeof points[i].y === 'number') {
              ctx.lineTo(points[i].x, points[i].y);
            }
          }
          
          ctx.stroke();
        } catch (err) {
          console.error("Error rendering stroke:", err, stroke);
        }
      });
      
      console.log("All saved strokes rendered");
    } catch (error) {
      console.error('Failed to fetch strokes:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setState(prev => ({ ...prev, currentColor: COLORS.BLACK }))}
            className={`p-2 rounded ${state.currentColor === COLORS.BLACK ? 'bg-white/20' : ''}`}
          >
            <div className="w-6 h-6 bg-black rounded-full" />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, currentColor: COLORS.RED }))}
            className={`p-2 rounded ${state.currentColor === COLORS.RED ? 'bg-white/20' : ''}`}
          >
            <div className="w-6 h-6 bg-red-500 rounded-full" />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, currentColor: COLORS.BLUE }))}
            className={`p-2 rounded ${state.currentColor === COLORS.BLUE ? 'bg-white/20' : ''}`}
          >
            <div className="w-6 h-6 bg-blue-500 rounded-full" />
          </button>
          <button
            onClick={() => setState(prev => ({ ...prev, currentColor: COLORS.GREEN }))}
            className={`p-2 rounded ${state.currentColor === COLORS.GREEN ? 'bg-white/20' : ''}`}
          >
            <div className="w-6 h-6 bg-green-500 rounded-full" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded"
        >
          <X size={20} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full cursor-crosshair"
      />
    </div>
  );
};

export default DrawBoard; 