import { css } from "@linaria/core";
import { type MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";

const totalHeight = 278;
const trackerHeight = 18;
const travelHeight = totalHeight - trackerHeight;

const scrollbarClass = css`
  position: relative;
  width: 34px;
  height: ${totalHeight}px;
  top: 26px;
  left: 692px;
  user-select: none;

  > ._tracker {
    position: relative;
    height: ${trackerHeight}px;
    width: 100%;
    top: 10%;
    z-index: 1;
    border-radius: 0px;
  background: #a7a7a7;
  box-shadow: inset 2px 2px 4px #333,
            inset -2px -2px 4px #dcdcdc;
  }
`;

export const Scrollbar = ({
  onScrollChange,
  percentage,
}: React.ComponentPropsWithoutRef<"div"> & { percentage: number; onScrollChange: (percentage: number) => unknown }) => {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef(0);
  const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const trackClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (scrollTrackRef.current) {
        const rect = scrollTrackRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(travelHeight, e.clientY - rect.top - trackerHeight / 2));
        if (scrollThumbRef.current) {
          scrollThumbRef.current.style.top = `${y}px`;
        }
        numberRef.current = y;
        onScrollChange(y / travelHeight);
      }
    },
    [onScrollChange],
  );

  const handleTrackClick = trackClick;

  const handleThumbMousedown = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setScrollStartPosition(e.clientY);
    setIsDragging(true);
  }, []);

  const handleThumbMouseup = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) {
        setIsDragging(false);
      }
    },
    [isDragging],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const handleThumbMousemove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging && scrollTrackRef.current) {
        trackClick(e as unknown as React.MouseEvent<HTMLDivElement>);

        const rect = scrollTrackRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(travelHeight, e.clientY - rect.top - trackerHeight / 2));
        if (scrollThumbRef.current) {
          scrollThumbRef.current.style.top = `${y}px`;
        }
        numberRef.current = y;
      }
    },
    [isDragging, scrollStartPosition],
  );

  // Listen for mouse events to handle scrolling by dragging the thumb
  useEffect(() => {
    document.addEventListener("mousemove", handleThumbMousemove);
    document.addEventListener("mouseup", handleThumbMouseup);
    document.addEventListener("mouseleave", handleThumbMouseup);
    return () => {
      document.removeEventListener("mousemove", handleThumbMousemove);
      document.removeEventListener("mouseup", handleThumbMouseup);
      document.removeEventListener("mouseleave", handleThumbMouseup);
    };
  }, [handleThumbMousemove, handleThumbMouseup]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div className={scrollbarClass} ref={scrollTrackRef} onClick={handleTrackClick} onMouseDown={handleThumbMousedown}>
      <div
        className="_tracker"
        ref={scrollThumbRef}
        style={{ top: `${isDragging ? numberRef.current : percentage * travelHeight}px` }}
      />
    </div>
  );
};

export default Scrollbar;
