import { createContext, useContext } from "react";

export interface AppContext {
  audio: HTMLAudioElement;
  play: (src?: string) => void;
  src?: string;
}
export const appContext = createContext<AppContext>({
  audio: new Audio(),
  play: () => {},
});

export const useApp = () => {
  return useContext(appContext);
};
