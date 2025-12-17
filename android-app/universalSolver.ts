import type { SolverOptions } from '../../src/lib/solver';

// Copy of universalSolver from src/lib/solver.ts for now
export function universalSolver(options: SolverOptions): string[] {
  const { dictionary, pattern, mustContain, mustExclude } = options;
  const requiredChars = mustContain.toUpperCase().split('').filter(c => c.trim());
  const excludedChars = mustExclude.toUpperCase().split('').filter(c => c.trim());
  const regexPattern = pattern ? new RegExp(`^${pattern.replace(/\?/g, '.')}$`, 'i') : null;
  return dictionary.filter(word => {
    const wordUpper = word.toUpperCase();
    if (regexPattern && !regexPattern.test(word)) return false;
    for (const char of excludedChars) if (wordUpper.includes(char)) return false;
    for (const char of requiredChars) if (!wordUpper.includes(char)) return false;
    return true;
  });
}
