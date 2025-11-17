
import React from 'react';

// The props should extend the standard HTML Img attributes
// so we can pass src, alt, className, etc.
interface AlpenblickLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const AlpenblickLogo: React.FC<AlpenblickLogoProps> = (props) => (
  // We add a default alt tag but allow it to be overridden by props.
  <img alt="Alpenblick Logo" {...props} />
);
