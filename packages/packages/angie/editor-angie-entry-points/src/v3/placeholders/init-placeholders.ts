import { __ } from '@wordpress/i18n';

import { registerV3AngieControl } from '../registry';
import type { V3ControlView } from '../types';

const isMediaImageControl = ( view: V3ControlView ): boolean => {
	const mediaTypes = view.options.model.get( 'media_types' );
	const controlType = view.options.model.get( 'type' );

	return (
		Array.isArray( mediaTypes ) &&
		mediaTypes.includes( 'image' ) &&
		'string' === typeof controlType &&
		! controlType.includes( 'media-preview' )
	);
};

/**
 * Placeholder Angie controls for V3 AI types that do not have a dedicated
 * replacement ticket yet (media, excerpt). Keeps the sparkle in the same
 * control slot so the UI does not go empty after legacy AI deletion.
 */
export function initV3PlaceholderControls(): void {
	registerV3AngieControl( {
		types: [ 'media' ],
		shouldApply: ( view ) => isMediaImageControl( view ),
		buildPrompt: ( { context } ) =>
			[
				`Update the media / image control "${ context.controlName }" on element "${ context.elementId }".`,
				'Help the user create or replace this image with AI.',
				'Describe what you need from the user, then wait for their prompt.',
			].join( '\n\n' ),
		getButtonLabel: () => __( 'Create with AI', 'elementor' ),
	} );

	registerV3AngieControl( {
		types: [ 'excerpt' ],
		buildPrompt: ( { context, getControlValue } ) => {
			const currentValue = typeof getControlValue === 'function' ? getControlValue() : context.controlValue;
			const hasExcerpt = 'string' === typeof currentValue && Boolean( currentValue.trim() );

			return [
				`Update the post excerpt control "${ context.controlName }" on element "${ context.elementId }".`,
				hasExcerpt
					? 'Help the user rewrite or improve the existing excerpt.'
					: 'Help the user write a new excerpt from the page content.',
			].join( '\n\n' );
		},
		getButtonLabel: ( { getControlValue, additionalOptions } ) => {
			const defaultValue = additionalOptions?.defaultValue;
			const currentValue = getControlValue();
			const isDefaultValue = defaultValue === currentValue;
			return isDefaultValue ? __( 'Write with AI', 'elementor' ) : __( 'Edit with AI', 'elementor' );
		},
	} );
}
