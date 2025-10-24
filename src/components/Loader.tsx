import React from 'react';
import './Loader.css';

interface LoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Loader({ message = 'Loading...', size = 'medium' }: LoaderProps) {
  return (
    <div className={`loader loader--${size}`}>
      <div className="loader__spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      
      {message && (
        <div className="loader__message">
          {message}
        </div>
      )}
    </div>
  );
}