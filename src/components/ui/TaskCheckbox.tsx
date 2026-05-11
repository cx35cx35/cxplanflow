import { useState, useCallback } from 'react';

interface Props {
  completed: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { box: 'w-4 h-4', icon: 8 },
  md: { box: 'w-5 h-5', icon: 10 },
  lg: { box: 'w-7 h-7', icon: 14 },
};

export default function TaskCheckbox({ completed, onToggle, size = 'md' }: Props) {
  const [animating, setAnimating] = useState(false);
  const { box, icon } = sizes[size];

  const handleClick = useCallback(() => {
    if (!completed) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    }
    onToggle();
  }, [completed, onToggle]);

  return (
    <button
      onClick={handleClick}
      className={`${box} rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 relative ${
        completed
          ? 'bg-accent border-accent'
          : 'border-surface-border hover:border-accent'
      }`}
    >
      {completed && (
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 10 10"
          fill="none"
          className={animating ? 'animate-check-bounce' : ''}
        >
          <path
            d="M2 5L4 7L8 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {animating && (
        <span
          className="absolute inset-0 rounded-full bg-accent/30 animate-ripple"
          style={{ animation: 'ripple 0.5s ease-out forwards' }}
        />
      )}
    </button>
  );
}
