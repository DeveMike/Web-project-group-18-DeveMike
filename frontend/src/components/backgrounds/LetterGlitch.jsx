import React, { useRef, useEffect } from 'react';

const LetterGlitch = ({
  active,
  fontSize = 14,
  glitchSpeed = 50,
  density = 0.08,
  colors = ['#00ff6a', '#00e676', '#1aff9c'],
  background = '#000000'
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let columns = Math.floor(width / fontSize);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    let drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = `rgba(0, 0, 0, ${1 - density})`;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, glitchSpeed);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = Array(columns).fill(1);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, fontSize, glitchSpeed, density, colors, background]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: background
      }}
    />
  );
};

export default LetterGlitch;
