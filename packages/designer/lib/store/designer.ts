import { store } from "./base";

export interface DesignerState {
  config: Record<string, any>;
}

const setConfig = (state: DesignerState) => (config: Record<string, any>) => {
  state.config = config;
};

export const useDesignerStore = store(
  {
    config: { fields: [], listeners: [], datasource: {} },
  },
  { setConfig },
);
