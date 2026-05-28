import { diagram } from './diagram.js';

export const pgPlanDiagram = {
  id: 'pg-plan',
  detector: (text) => {
    if (!text || typeof text !== 'string') return false;
    const t = text.trim();
    if (/^pg-plan\b/i.test(t)) return true;
    if (/^explain\b/i.test(t)) return true;
    if (/\(cost=[\d.]+\.\.[\d.]+\s+rows=/i.test(t)) return true;
    if (/->\s+\w+\s+Scan/i.test(t)) return true;
    if (/Sort\s+\(cost=/i.test(t)) return true;
    return false;
  },
  loader: async () => ({
    id: 'pg-plan',
    diagram,
  }),
};

export default pgPlanDiagram;

// Auto-register if mermaid is globally available
if (typeof window !== 'undefined' && window.mermaid) {
  window.mermaid.registerExternalDiagrams([pgPlanDiagram]).catch(() => {});
}
