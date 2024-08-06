import { css, cx } from "@linaria/core";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import DownloadIcon from "#icons/download-24.svg";
import { Icon } from "./Icon.tsx";

import { useVirtualizer } from "@tanstack/react-virtual";
import { closest } from "fastest-levenshtein";
import { dataset } from "#app/dataset";
import { fuzzyMatch } from "#app/fuzzyMatch.ts";
import type { WrittenName } from "#app/types";
import { useApp } from "../hooks/useAudio.ts";
import { Scrollbar } from "./Scrollbar.tsx";

const nameListClass = css`
  position: relative;
  top: 354px;
  left: 396px;
  height: 378px;
  width: 296px;
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
      }
      
      > ._link {
        filter: opacity(0);
        transition: ease 0.25s filter;
      }
      &._selected {
        background: #f8b7d8;

        > ._link {
          filter: opacity(100%);
        }
      }

      :hover {
        ._icon {
          visibility: visible;
        }
      }
    }
  }
`;

export const NameListAudioKey = "_audio-list-audio-key" as const;

export const NameList: FC<{
  filter?: string;
}> = ({ filter }) => {
  const [selection, setSelection] = useState<{ name: WrittenName; played?: boolean } | undefined>();
  const [travelPercentage, setTravelPercentage] = useState(0);
  const app = useApp();

  useEffect(() => {
    if (!selection || selection.played) {
      return;
    }
    setSelection({ ...selection, played: true });
    app.play(`audio/${dataset.writtenToPhonetic[selection.name]}.mp3`);
  }, [selection, app.play]);
  const filteredNames = useMemo(() => {
    if (filter) {
      return dataset.sortedWritten.filter((x) => fuzzyMatch(filter, x));
    }
    return dataset.sortedWritten;
  }, [filter]);

  // The scrollable element for your list
  const parentRef = useRef<HTMLDivElement | null>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: filteredNames.length,
    onChange: (instance) => {
      const range = instance.calculateRange();
      if (!range) {
        return;
      }
      const remainingItems = filteredNames.length - (range.endIndex - range.startIndex);
      const travel = range.startIndex / (remainingItems - 1);

      setTravelPercentage(travel);
    },
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  });

  useEffect(() => {
    if (filter) {
      const match = closest(filter, filteredNames) as WrittenName;
      const index = filteredNames.indexOf(match);
      rowVirtualizer.scrollToIndex(index, { behavior: "auto", align: "center" });
      const handle = setTimeout(() => {
        setSelection({ name: filteredNames[index] });
      }, 500);

      setTravelPercentage(index / filteredNames.length);
      return () => clearTimeout(handle);
    }
  }, [filteredNames, filter, rowVirtualizer]);
  return (
    <>
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
                })
              }
            >
              <div className="_name">{filteredNames[virtualItem.index]}</div>
              <a
                className="_link"
                href={`audio/${dataset.writtenToPhonetic[filteredNames[virtualItem.index]]}.ogg`}
                download
              >
                <Icon iconUrl={DownloadIcon} />
              </a>
            </div>
          ))}
        </div>
      </div>
      <Scrollbar
        percentage={travelPercentage}
        onScrollChange={(percentage) => {
          rowVirtualizer.scrollToOffset(percentage * (rowVirtualizer.getTotalSize() - 378));
        }}
      />
    </>
  );
};
