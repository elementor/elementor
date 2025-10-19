import { createTransformer, styleTransformersRegistry } from '@elementor/editor-canvas';

import { excludePropTypeTransformers } from './consts';
import { stylesInheritanceTransformersRegistry } from './styles-inheritance-transformers-registry';
import { arrayTransformer } from './transformers/array-transformer';
import { backgroundColorOverlayTransformer } from './transformers/background-color-overlay-transformer';
import { backgroundGradientOverlayTransformer } from './transformers/background-gradient-overlay-transformer';
import { backgroundImageOverlayTransformer } from './transformers/background-image-overlay-transformer';
import { boxShadowTransformer } from './transformers/box-shadow-transformer';
import { colorTransformer } from './transformers/color-transformer';
import { createStringToLinesTransformer } from './transformers/string-to-lines-transformer';

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
	const originalStyleTransformers = styleTransformersRegistry.all();

	stylesInheritanceTransformersRegistry.register( 'color', colorTransformer );
	stylesInheritanceTransformersRegistry.register( 'background-color-overlay', backgroundColorOverlayTransformer );
	stylesInheritanceTransformersRegistry.register(
		'background-gradient-overlay',
		backgroundGradientOverlayTransformer
	);
	stylesInheritanceTransformersRegistry.register( 'background-image-overlay', backgroundImageOverlayTransformer );
	stylesInheritanceTransformersRegistry.register( 'shadow', boxShadowTransformer );

	stylesInheritanceTransformersRegistry.register(
		'filter',
		createStringToLinesTransformer( originalStyleTransformers.filter )
	);
	stylesInheritanceTransformersRegistry.register(
		'backdrop-filter',
		createStringToLinesTransformer( originalStyleTransformers[ 'backdrop-filter' ] )
	);
	stylesInheritanceTransformersRegistry.register(
		'transition',
		createStringToLinesTransformer( originalStyleTransformers.transition, ', ' )
	);

	[ 'background-overlay', 'box-shadow', 'transform-functions' ].forEach( ( propType ) =>
		stylesInheritanceTransformersRegistry.register( propType, arrayTransformer )
	);
}
