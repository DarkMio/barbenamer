import names from "#assets/names.json";
import type { PhoneticName, WrittenName } from "./types";

const makeIndex = () => {
  const allFiles = Object.keys(names) as PhoneticName[];
  const allNames = new Set([...allFiles.flatMap((x) => names[x as PhoneticName])]);
  const nameToFile = allFiles.reduce(
    (obj, name) => {
      const values = names[name];
      for (const value of values) {
        obj[value as WrittenName] = name;
      }
      return obj;
    },
    {} as Record<WrittenName, PhoneticName>,
  );

  return {
    phoneticToWritten: names as Record<PhoneticName, WrittenName[]>,
    writtenToPhonetic: nameToFile,
    sortedPhonetics: allFiles.sort((a, b) => a.localeCompare(b)),
    sortedWritten: [...allNames].sort((a, b) => a.localeCompare(b)) as WrittenName[],
  };
};

export const dataset = makeIndex();
