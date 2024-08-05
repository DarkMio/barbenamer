export const fuzzyMatch = (input: string, comparison: string) => {
  // biome-ignore lint/style/noParameterAssign: trivial
  input = input.toLowerCase();
  // biome-ignore lint/style/noParameterAssign: trivial
  comparison = comparison.toLowerCase();
  const inputCharacters = Array.from(input);
  const comparisonCharacters = Array.from(comparison);

  while (true) {
    const character = inputCharacters.shift();
    if (!character) {
      return true;
    }
    if (!comparisonCharacters.includes(character)) {
      return false;
    }
    const index = comparisonCharacters.indexOf(character);
    comparisonCharacters.splice(index, 1);
  }
};
