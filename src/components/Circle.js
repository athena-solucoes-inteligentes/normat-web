import React from 'react';

const Circle = ({ size, color, margin }) => (
  <span style={{
    width: size,
    height: size,
    display: 'inline-block',
    background: color,
    borderRadius: '50%',
    margin,
   }} />
);

export default Circle;
