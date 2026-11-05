type EditorAngieConfig = {
  isAngiePluginActive?: boolean;
};

const getConfig = (): EditorAngieConfig | undefined => {
  return ( window as Window & { elementorEditorAngie?: EditorAngieConfig } ).elementorEditorAngie;
};

export const isAngiePluginActive = (): boolean => {
  return getConfig()?.isAngiePluginActive === true;
};
