import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';

const { registerAction } = controlActionsMenu;

// TODO: BC: Only background repeater supports reset; remove this constant once all repeaters support it.
const REPEATERS_SUPPORTED_FOR_RESET = [ 'background' ];

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, resetValue, path, propType } = useBoundProp();

	const isInRepeater = path?.some( ( key ) => ! isNaN( Number( key ) ) );
	const isRepeaterTypeSupported = REPEATERS_SUPPORTED_FOR_RESET.includes( path?.[ 0 ] );
	const isRequired = propType?.settings?.required;

	const shouldShowResetForRepeater = ! isRequired && ( ! isInRepeater || isRepeaterTypeSupported );

	return {
		visible: isStyle && value !== null && value !== undefined && shouldShowResetForRepeater,
		title: __( 'Clear', 'elementor' ),
		icon: BrushBigIcon,
		onClick: () => resetValue(),
	};
}
