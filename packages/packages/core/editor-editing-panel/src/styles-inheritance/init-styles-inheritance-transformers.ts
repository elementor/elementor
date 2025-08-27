import { createTransformer, styleTransformersRegistry } from '@elementor/editor-canvas';

import { excludePropTypeTransformers } from './consts';
import { stylesInheritanceTransformersRegistry } from './styles-inheritance-transformers-registry';
import { backgroundColorOverlayTransformer } from './transformers/background-color-overlay-transformer';
import { backgroundGradientOverlayTransformer } from './transformers/background-gradient-overlay-transformer';
import { backgroundImageOverlayTransformer } from './transformers/background-image-overlay-transformer';
import { backgroundOverlayTransformer } from './transformers/background-overlay-transformer';

export function initStylesInheritanceTransformers() {
	const originalStyleTransformers = styleTransformersRegistry.all();

	Object.entries( originalStyleTransformers ).forEach( ( [ propType, transformer ] ) => {
		if ( excludePropTypeTransformers.has( propType ) ) {
			return;
		}

		stylesInheritanceTransformersRegistry.register( propType, transformer );
	} );

	stylesInheritanceTransformersRegistry.registerFallback(
		createTransformer( ( value: unknown ) => {
			return value;
		} )
	);

	registerCustomTransformers();
}

function registerCustomTransformers() {
	stylesInheritanceTransformersRegistry.register( 'background-color-overlay', backgroundColorOverlayTransformer );
	stylesInheritanceTransformersRegistry.register(
		'background-gradient-overlay',
		backgroundGradientOverlayTransformer
	);
	stylesInheritanceTransformersRegistry.register( 'background-image-overlay', backgroundImageOverlayTransformer );
	stylesInheritanceTransformersRegistry.register( 'background-overlay', backgroundOverlayTransformer );
}
