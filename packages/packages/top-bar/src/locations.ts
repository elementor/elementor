import { createInjectIntoFnFor } from '@elementor/locations';

export const LOCATION_MAIN_MENU = 'editor/top-bar/main-menu' as const;
export const LOCATION_TOOLS_MENU = 'editor/top-bar/tools' as const;
export const LOCATION_CANVAS_VIEW = 'editor/top-bar/canvas-view' as const; // What this name means?
export const LOCATION_UTILITIES_MENU = 'editor/top-bar/utilities' as const;
export const LOCATION_PRIMARY_ACTION = 'editor/top-bar/primary-action' as const;

export const injectIntoMainMenu = createInjectIntoFnFor( LOCATION_MAIN_MENU );
export const injectIntoToolsMenu = createInjectIntoFnFor( LOCATION_TOOLS_MENU );
export const injectIntoCanvasView = createInjectIntoFnFor( LOCATION_CANVAS_VIEW );
export const injectIntoUtilitiesMenu = createInjectIntoFnFor( LOCATION_UTILITIES_MENU );
export const injectIntoPrimaryAction = createInjectIntoFnFor( LOCATION_PRIMARY_ACTION );

