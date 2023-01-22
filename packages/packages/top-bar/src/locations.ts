import { createInjectIntoFnFor } from '@elementor/locations';

export const LOCATION_MAIN_MENU = 'editor/top-bar/main-menu' as const;
export const LOCATION_TOOLS_MENU = 'editor/top-bar/tools' as const;
export const LOCATION_CANVAS_VIEW = 'editor/top-bar/canvas-view' as const; // ??
export const LOCATION_UTILITIES_MENU = 'editor/top-bar/utilities' as const;
export const LOCATION_PRIMARY_ACTION = 'editor/top-bar/primary-action' as const;

export const injectIntoMainMenuLocation = createInjectIntoFnFor( LOCATION_MAIN_MENU );
export const injectIntoToolsMenuLocation = createInjectIntoFnFor( LOCATION_TOOLS_MENU );
export const injectIntoCanvasViewLocation = createInjectIntoFnFor( LOCATION_CANVAS_VIEW );

