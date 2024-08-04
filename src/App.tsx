import { type FC, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { css, cx } from "@linaria/core";
import { Icon } from "./Icon";
import names from "./assets/names.json";
import DownloadIcon from "./icons/download-24.svg";

import { useVirtualizer } from "@tanstack/react-virtual";

type PhoneticName = keyof typeof names;
type WrittenName = string & { __writtenNameBrand: never };

const makeIndex = () => {
	const allFiles = Object.keys(names) as PhoneticName[];
	const allNames = new Set([
		...allFiles.flatMap((x) => names[x as PhoneticName]),
	]);
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
		sortedWritten: [...allNames].sort((a, b) =>
			a.localeCompare(b),
		) as WrittenName[],
	};
};

const index = makeIndex();

const appLayoutClass = css`
  #root {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
`;

const nameListClass = css`
  max-height: 450px;
  width: 300px;
  margin: 24px auto 24px auto;
  overflow: auto;

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
        background: #333;
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

const NameList: FC<{
	filter?: string;
}> = ({ filter }) => {
	const [selection, setSelection] = useState<
		{ name: WrittenName; time: number } | undefined
	>();

	useEffect(() => {
		console.log("effect");
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
		estimateSize: () => 24,
	});

	return (
		<div className={nameListClass} ref={parentRef}>
			<div
				className="_list"
				style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
			>
				{rowVirtualizer.getVirtualItems().map((virtualItem) => (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<div
						key={virtualItem.key}
						className={cx(
							"_entry",
							filteredNames[virtualItem.index] === selection?.name &&
								"_selected",
						)}
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
						<a
							href={`audio/${index.writtenToPhonetic[filteredNames[virtualItem.index]]}.ogg`}
							download
						>
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
			<h1>Team Barbie Detective</h1>
			<label>
				Detective{" "}
				<input
					placeholder="Your Name"
					value={filter}
					onChange={(evt) => setFilter(evt.currentTarget.value)}
				/>
			</label>
			<NameList filter={filter} />
		</main>
	);
};

export default App;
