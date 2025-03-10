// Generate visually pleasant colors
export const generateColor = (index: number): string => {
  // Generate colors with good contrast using golden angle approximation
  const hue = (index * 137.5) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};