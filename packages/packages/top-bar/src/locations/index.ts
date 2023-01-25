import { createInjectIntoFnFor } from '@elementor/locations';
import { LOCATION_CANVAS_VIEW, LOCATION_PRIMARY_ACTION } from './consts';
import { createRegisterMenuItemFor } from './register-menu-item';
import Link from '../components/public/link';
import Action from '../components/public/action';
import ToggleAction from '../components/public/toggle-action';

export * from './consts';

export const injectIntoCanvasView = createInjectIntoFnFor( LOCATION_CANVAS_VIEW );
export const injectIntoPrimaryAction = createInjectIntoFnFor( LOCATION_PRIMARY_ACTION );
export const registerLink = createRegisterMenuItemFor( Link );
export const registerAction = createRegisterMenuItemFor( Action );
export const registerToggleAction = createRegisterMenuItemFor( ToggleAction );
