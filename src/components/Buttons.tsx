import { css, cx } from "@linaria/core";
import { type FC, useContext } from "react";
import { appContext, useApp } from "../hooks/useAudio";

const buttonClass = css`
  position: absolute;
  opacity: 0;
  cursor: pointer;  

  &._speaker {
    top: 832px;
    left: 558px;
    width: 148px;
    height: 84px;
  }

  &._accept {
    height: 86px;
    width: 84px;
    left: 450px;
    top: 844px;
  }

  &._save {
    width: 155px;
    height: 100px;
    left: 746px;
    top: 804px;
  }
`;

export const Buttons: FC<{
  onAcceptClicked?: () => unknown;
}> = ({ onAcceptClicked }) => {
  const app = useContext(appContext);
  return (
    <>
      <button
        type="button"
        className={cx(buttonClass, "_speaker")}
        onClick={() => {
          app.play();
        }}
      >
        Ping
      </button>

      <button type="button" className={cx(buttonClass, "_accept")} onClick={onAcceptClicked}>
        Check
      </button>

      <a className={cx(buttonClass, "_save")} href={app.src} download={app.src}>
        Save
      </a>
    </>
  );
};
