import { __ } from '@wordpress/i18n';

import { buildAngieSiteLogoPrompt } from '../../prompts';
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
 * Keep editor AI sparks visible for types without a dedicated Angie replace ticket yet.
 * ED-26337 deleted the legacy modals; these placeholders open Angie so the slots do not go empty.
 */
export function initV3PlaceholderControls(): void {
	registerV3AngieControl( {
		types: [ 'media' ],
		shouldApply: ( view ) => isMediaImageControl( view ),
		buildPrompt: ( { context } ) => {
			if ( 'site_logo' === context.controlName ) {
				return buildAngieSiteLogoPrompt();
			}

			return [
				`Update the media / image control "${ context.controlName }" on element "${ context.elementId }".`,
				'Help the user create or replace this image with AI.',
			].join( '\n\n' );
		},
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
			return defaultValue === currentValue
				? __( 'Write with AI', 'elementor' )
				: __( 'Edit with AI', 'elementor' );
		},
	} );
}
