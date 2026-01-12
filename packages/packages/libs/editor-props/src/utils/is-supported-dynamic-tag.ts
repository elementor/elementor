import { type PropValue, type TransformablePropValue } from '../types';

type ExtendedWindow = Window & {
	elementor: {
		config: {
			atomicDynamicTags: {
				tags: Record< string, unknown >;
			};
		};
	};
};

type DynamicTransformablePropValue = TransformablePropValue< 'dynamic', { name: string } >;

const extendedWindow = window as unknown as ExtendedWindow;
export const isSupportedDynamicTag = ( value: PropValue ): boolean => {
	if ( ! value ) {
		return false;
	}

	return !! extendedWindow.elementor?.config?.atomicDynamicTags?.tags[
		( value as DynamicTransformablePropValue )?.value?.name
	];
};

export const isDynamicValueButUnsupportedTag = ( value: PropValue ): boolean => {
	if ( ! value ) {
		return false;
	}

	return ( value as DynamicTransformablePropValue )?.$$type === 'dynamic' && ! isSupportedDynamicTag( value );
};
