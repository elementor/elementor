import { type V1Element } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { __ } from '@wordpress/i18n';

import { undoableApplyElementStyles } from './apply-element-styles';

type PasteElementStyleArgs = {
	containers: V1Element[];
	newStyle: StyleDefinition;
};

export const undoablePasteElementStyle = () => {
	const applyElementStyles = undoableApplyElementStyles();

	return ( { containers, newStyle }: PasteElementStyleArgs ) =>
		applyElementStyles( {
			entries: containers.map( ( container ) => ( { container, variants: newStyle.variants } ) ),
			subtitle: __( 'Style Pasted', 'elementor' ),
		} );
};
