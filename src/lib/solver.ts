// src/lib/solver.ts

export type SolverOptions = {
  dictionary: string[];
  pattern: string;       // User types "S..RE" or "....."
  mustContain: string;   // User types "EA"
  mustExclude: string;   // User types "XY"
  minLen?: number;       // For generic filtering
};

export function universalSolver(options: SolverOptions): string[] {
  const { dictionary, pattern, mustContain, mustExclude } = options;
  
  // Clean inputs
  const requiredChars = mustContain.toUpperCase().split('').filter(c => c.trim());
  const excludedChars = mustExclude.toUpperCase().split('').filter(c => c.trim());
  
  // Convert pattern "S..RE" -> Regex /^S..RE$/i
  // We treat '.' or '?' as wildcards
  const regexPattern = pattern 
    ? new RegExp(`^${pattern.replace(/\?/g, '.')}$`, 'i') 
    : null;

  return dictionary.filter(word => {
    const wordUpper = word.toUpperCase();

    // 1. Pattern Check (Length & Positions)
    if (regexPattern && !regexPattern.test(word)) {
      return false;
    }

    // 2. Exclude Check (Gray Letters)
    // Optimization: Check this first as it fails fastest
    for (const char of excludedChars) {
      if (wordUpper.includes(char)) return false;
    }

    // 3. Contain Check (Yellow Letters)
    for (const char of requiredChars) {
      if (!wordUpper.includes(char)) return false;
    }

    return true;
  });
}