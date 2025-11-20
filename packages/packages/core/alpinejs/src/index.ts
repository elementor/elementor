import { Alpine } from '@alpinejs/csp';

export { Alpine } from '@alpinejs/csp';
export { init } from './init';

export const reinitTree = ( element: Element ) => {
	Alpine.nextTick( () => {
		Alpine.destroyTree( element as HTMLElement );
		Alpine.initTree( element as HTMLElement );
	} );
};
