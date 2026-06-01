import { ObjectSectionControl } from '../controls/object-section-control';
import { controlsRegistry } from './controls-registry';

export const registerObjectSectionControl = () => {
	controlsRegistry.register( 'object-section', ObjectSectionControl, 'custom' );
};
