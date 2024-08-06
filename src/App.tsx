import { css } from "@linaria/core";
import { type FC, useEffect, useState } from "react";
import { lerp, remap } from "#app/math";
import { Buttons } from "#components/Buttons";
import { NameList } from "#components/NameList";
import BackgroundImage from "./assets/barbie-screen.png";
import { appContext } from "./hooks/useAudio";

const appLayoutClass = css`
    aspect-ratio: 1280/960;
    width: 1280px;
    height: 960px;
    overflow: hidden;
    overflow-y: hidden;
    overflow-x: hidden;
    background: url(${BackgroundImage});
    background-size: cover;
    align-self: center;
    scroll-behavior: none;

    top: 50%;
    left: 50%;


    > ._input {
      position: relative;
      top: 324px;
      left: 498px;
      // right: 38.125%;
      height: 38px;
      width: 294px;
      background: transparent;
      font-family: 'Arial';
      font-weight: 700;
      font-size: 22px;
      color: #000;
      border: none;
      padding: 0 0 0 6px;
      caret-shape: underscore;

      &:focus {
        outline: none;
        border-color: inherit;
        box-shadow: none;
      }
    }
  `;

const App: FC = () => {
  const [filter, setFilter] = useState("");
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", onResize);
    () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const gradient = remap(windowSize.width, 1000, 1280, 0, 1, true);
  const optimalScale = windowSize.width < 1280 ? windowSize.width / 800 : 1;
  const scale = lerp(optimalScale, 1, gradient, true);
  const overhang = windowSize.width < 1280 ? (1280 - windowSize.width) / 2 : 0;

  const [audio, _setAudio] = useState(new Audio());
  const [src, setSrc] = useState<string | undefined>(undefined);

  const play = (newSrc?: string) => {
    if (newSrc !== src) {
      setSrc(newSrc);
      if (newSrc) {
        audio.src = newSrc;
      }
    }
    audio.play();
  };

  return (
    <main
      className={appLayoutClass}
      style={{
        transform: `scale(${scale})`,
        marginLeft: `-${overhang}px`,
      }}
    >
      <appContext.Provider value={{ audio, src, play }}>
        <input
          className="_input"
          placeholder="Your Name"
          value={filter}
          onChange={(evt) => setFilter(evt.currentTarget.value)}
        />
        <NameList filter={filter} />
        <Buttons />
      </appContext.Provider>
    </main>
  );
};

export default App;
