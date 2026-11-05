export {};

declare global {
  interface Window {
    elementorV2?: {
      editorAngie?: {
        openAngie?: ( request: { prompt: string; mode: 'ask' } ) => void;
      };
    };
  }
}
