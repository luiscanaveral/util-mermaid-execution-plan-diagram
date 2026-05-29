export const NODE_COLORS = {
  scan: '#4CAF50',
  join: '#2196F3',
  aggregate: '#FF9800',
  modify: '#f44336',
  other: '#9E9E9E',
};

export const NODE_COLORS_DARK = {
  scan: '#40a02b',
  join: '#1e66f5',
  aggregate: '#df8e1d',
  modify: '#d20f39',
  other: '#6c7086',
};

export function getStyles(options = {}) {
  return `
    .plan-node { transition: opacity 0.2s; }
    .plan-node:hover { opacity: 0.85; }
  `;
}
