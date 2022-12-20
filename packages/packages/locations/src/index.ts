import { LocationsManager } from './locations-manager';

console.log( 'loaded: editor-locations' );

export { LocationsManager } from './locations-manager';
export { Slot } from './components/slot';

// TODO: Are we OK with exporting an instance?
export default new LocationsManager();
