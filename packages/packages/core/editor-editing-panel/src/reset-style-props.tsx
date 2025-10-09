import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';

const { registerAction } = controlActionsMenu;

// TODO: Only background repeater supports reset; remove this constant once all repeaters support it.
const REPEATERS_SUPPORTED_FOR_RESET = [ 'background' ];

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, setValue, path, propType } = useBoundProp();
	const hasValue = value !== null && value !== undefined;

	// TODO: Once all repeaters support reset remove this condition
	const isInRepeater = path?.some( ( key ) => ! isNaN( Number( key ) ) );
	const repeaterName = path?.[ 0 ];

	const isRepeaterSupported = REPEATERS_SUPPORTED_FOR_RESET.includes( repeaterName );

	const shouldShowRepeater = ! isInRepeater || isRepeaterSupported;

	const getResetValue = () => {
		if ( propType?.default !== null && propType?.default !== undefined ) {
			return propType.default;
		}

		return null;
	};

	return {
		visible: isStyle && hasValue && shouldShowRepeater && ! areValuesEqual( value, propType?.default ),
		title: __( 'Clear', 'elementor' ),
		icon: BrushBigIcon,
		onClick: () => setValue( getResetValue() ),
	};
}

function areValuesEqual( a: unknown, b: unknown ): boolean {
	try {
		return JSON.stringify( a ) === JSON.stringify( b );
	} catch {
		return false;
	}
}
