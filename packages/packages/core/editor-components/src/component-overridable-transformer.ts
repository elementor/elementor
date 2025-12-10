import { createTransformer, settingsTransformersRegistry } from '@elementor/editor-canvas';

import { type ComponentOverridable } from './types';

export const componentOverridableTransformer = createTransformer(
	async ( value: ComponentOverridable, options: { key: string; signal?: AbortSignal } ) => {
		// todo: render component overrides
		return await transformOriginValue( value, options );
	}
);

async function transformOriginValue( value: ComponentOverridable, options: { key: string; signal?: AbortSignal } ) {
	if ( ! value.origin_value || ! value.origin_value.value || ! value.origin_value.$$type ) {
		return null;
	}

	// return value.origin_value;

	const transformer = settingsTransformersRegistry.get( value.origin_value.$$type );

	if ( ! transformer ) {
		return null;
	}

	try {
		return await transformer( value.origin_value.value, options );
	} catch {
		return null;
	}
}
