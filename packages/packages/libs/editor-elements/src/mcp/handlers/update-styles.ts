import { type Props } from '@elementor/editor-props';
import { type StyleDefinitionState } from '@elementor/editor-styles';

import { updateElementStyle } from '../../styles/update-element-style';
import { getElementStyles } from '../../sync/get-element-styles';
import { resolveBreakpointId } from './common-style-utils';

export function handleUpdateStyles( {
	elementId,
	styleId,
	styles,
	breakpoint = 'desktop',
	state = null,
}: {
	elementId: string;
	styleId?: string;
	styles: Props;
	breakpoint?: string | null;
	state?: string | null;
} ): { success: boolean } {
	const resolvedBreakpoint = resolveBreakpointId( breakpoint );

	const resolvedState: StyleDefinitionState =
		state === null || state === undefined ? null : ( state as StyleDefinitionState );
	const elementStyles = getElementStyles( elementId );

	if ( ! elementStyles ) {
		throw new Error( `Element with ID "${ elementId }" has no styles. Create a style first.` );
	}

	const resolvedStyleId = styleId || Object.keys( elementStyles )[ 0 ];

	if ( ! resolvedStyleId ) {
		throw new Error( `Element with ID "${ elementId }" has no styles. Create a style first.` );
	}

	updateElementStyle( {
		elementId,
		styleId: resolvedStyleId,
		meta: { breakpoint: resolvedBreakpoint, state: resolvedState },
		props: styles,
	} );

	return { success: true };
}
