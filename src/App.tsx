import { css, cx } from "@linaria/core";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import BackgroundImage from "./assets/barbie-screen.png";
import names from "./assets/names.json";
import DownloadIcon from "./icons/download-24.svg";

import { useVirtualizer } from "@tanstack/react-virtual";
import { closest } from "fastest-levenshtein";

type PhoneticName = keyof typeof names;
type WrittenName = string & { __writtenNameBrand: never };

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

const index = makeIndex();

const appLayoutClass = css`



    aspect-ratio: 1280/960;
    background: url(${BackgroundImage});

    width: 100%;
    height: 100%;

    > ._input {
      position: relative;
      top: 33.8333%;
      left: 0.4%;  // 38.90625%;
      // right: 38.125%;
      height: 3.566%;
      width: 22.56875%;
      background: transparent;
      font-family: 'Arial';
      font-weight: 700;
      font-size: 24px;
      color: #000;
      border: none;
      caret-shape: underscore;

      &:focus {
        outline: none;
        border-color: inherit;
        box-shadow: none;
      }
    }
  `;

const nameListClass = css`
  position: relative;
  top: 34.8%;
  left: -7.5%;
  max-height: 39.6%;
  width: 23.05%;
  margin: 24px auto 24px auto;
  overflow: auto;
  color: #000000;
  font-family: 'Arial';
  font-weight: 700;
  font-size: 24px;

  scrollbar-width: none;

  > ._list {
    position: relative;

    > ._entry {
      cursor: pointer;
      display: flex;
      flex-direction: row;
      align-items: center;
      position: absolute;
      height: 24px;
      top: 0;
      left: 0;
      padding: 0 10px;
      width: 100%;

      gap: 24px;
      transition: ease 0.25s background-color;

      > ._name {
        text-transform: capitalize;
        flex: 1;
        text-align: justify;
      }

      > ._icon {
        margin: 0 24px;
        visibility: hidden;
      }
      &._selected {
        background: #f8b7d8;
      }

      :hover {
        ._icon {
          visibility: visible;
        }
      }
    }
  }
`;

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

const audioPlayer = new Audio();

export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = [an + 1];
    const row = matrix[i];
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j - 1], // substitution
            matrix[i][j - 1], // insertion
            matrix[i - 1][j], // deletion
          ) + 1;
      }
    }
  }
  return matrix[bn][an];
}

const NameList: FC<{
  filter?: string;
}> = ({ filter }) => {
  const [selection, setSelection] = useState<{ name: WrittenName; time: number } | undefined>();

  useEffect(() => {
    if (!selection) {
      return;
    }

    audioPlayer.src = `audio/${index.writtenToPhonetic[selection.name]}.ogg`;
    audioPlayer.play();
  }, [selection]);
  const filteredNames = useMemo(() => {
    if (filter) {
      return index.sortedWritten.filter((x) => fuzzyMatch(filter, x));
    }
    return index.sortedWritten;
  }, [filter]);

  // The scrollable element for your list
  const parentRef = useRef<HTMLDivElement | null>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredNames.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  useEffect(() => {
    if (filter) {
      const match = closest(filter, filteredNames) as WrittenName;
      const index = filteredNames.indexOf(match);
      rowVirtualizer.scrollToIndex(index + 2, { behavior: "smooth" });
      const handle = setTimeout(() => {
        setSelection({ name: filteredNames[index], time: Date.now() });
      }, 500);
      return () => clearTimeout(handle);
    }
  }, [filteredNames, filter, rowVirtualizer]);

  return (
    <div className={nameListClass} ref={parentRef}>
      <div className="_list" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            key={virtualItem.key}
            className={cx("_entry", filteredNames[virtualItem.index] === selection?.name && "_selected")}
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            onClick={() =>
              setSelection({
                name: filteredNames[virtualItem.index],
                time: Date.now(),
              })
            }
          >
            <div className="_name">{filteredNames[virtualItem.index]}</div>
            <a href={`audio/${index.writtenToPhonetic[filteredNames[virtualItem.index]]}.ogg`} download>
              <Icon iconUrl={DownloadIcon} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: FC = () => {
  const [filter, setFilter] = useState("");
  return (
    <main className={appLayoutClass}>
      <input
        className="_input"
        placeholder="Your Name"
        value={filter}
        onChange={(evt) => setFilter(evt.currentTarget.value)}
      />
      <NameList filter={filter} />
    </main>
  );
};

export default App;
