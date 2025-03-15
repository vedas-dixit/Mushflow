import React, { useEffect, useRef } from 'react';

interface MusicVisualizationProps {
  isPlaying: boolean;
}

export default function MusicVisualization({ isPlaying }: MusicVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // This is a placeholder for a real audio visualization
  // In a real implementation, this would connect to the audio element
  useEffect(() => {
    if (!canvasRef.current || !isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Simple animation for demonstration
    let animationId: number;
    let particles: { x: number; y: number; size: number; speed: number; color: string }[] = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 1,
        speed: Math.random() * 1 + 0.2,
        color: `hsl(${Math.random() * 60 + 30}, 100%, 75%)`
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(23, 23, 23, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.y -= particle.speed;
        
        if (particle.y < -particle.size) {
          particle.y = canvas.height + particle.size;
          particle.x = Math.random() * canvas.width;
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animate();
    }
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
} 