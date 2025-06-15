import { useEffect } from 'react';
import confetti from 'canvas-confetti';

const SparkleConfetti = () => {
  useEffect(() => {
    // Main burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a259ff', '#43e7ad', '#ff65d3', '#7e6aff'],
    });

    // Subtle streamers
    confetti({
      angle: 90,
      spread: 160,
      particleCount: 120,
      origin: { y: 0.6 },
      scalar: 0.9,
      shapes: ['square'],
    });
  }, []);
  return null;
};

export default SparkleConfetti; 