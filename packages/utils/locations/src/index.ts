import { LocationsManager } from './locations-manager';

console.log( 'loaded: editor-locations' );

export { LocationsManager } from './locations-manager';
export { Slot } from './components/slot';

export default new LocationsManager();

/**
 * 1. File names convention?
 * 2. Extend build / test / lint / etc. in packages vs root.
 * 3. Use eslint from elementor or create a new one?
 * 	3.1. Use standard eslint or WordPress?
 */
