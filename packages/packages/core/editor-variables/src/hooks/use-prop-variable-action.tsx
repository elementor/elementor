import * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropType } from '@elementor/editor-props';
import { type PopoverActionProps } from '@elementor/editor-ui';
import { ColorFilterIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { VariableSelectionPopover } from '../components/variable-selection-popover';
import { trackVariableEvent } from '../utils/tracking';
import { getVariableType } from '../variables-registry/variable-type-registry';

export const usePropVariableAction = (): PopoverActionProps => {
	const { propType, path } = useBoundProp();
	const variable = resolveVariableFromPropType( propType );

	return {
		visible: Boolean( variable ),
		icon: ColorFilterIcon,
		title: __( 'Variables', 'elementor' ),
		content: ( { close: closePopover } ) => {
			if ( ! variable ) {
				return null;
			}

			trackOpenVariablePopover( path, variable.variableType );

			return <VariableSelectionPopover closePopover={ closePopover } propTypeKey={ variable.propTypeUtil.key } />;
		},
	};
};

const resolveVariableFromPropType = ( propType: PropType ) => {
	if ( propType.kind !== 'union' ) {
		return undefined;
	}

	for ( const key of Object.keys( propType.prop_types ) ) {
		const variable = getVariableType( key );

		if ( variable ) {
			return variable;
		}
	}

	return undefined;
};

const trackOpenVariablePopover = ( path: string[], variableType: string ) => {
	trackVariableEvent( {
		varType: variableType,
		controlPath: path.join( '.' ),
		action: 'open',
	} );
};
