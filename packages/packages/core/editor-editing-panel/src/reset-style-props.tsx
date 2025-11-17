import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';
import { isEqual } from './utils/is-equal';

const { registerAction } = controlActionsMenu;

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, resetValue, propType } = useBoundProp();
	const hasValue = value !== null && value !== undefined;
	const hasInitial = propType.initial_value !== undefined && propType.initial_value !== null;
	const isRequired = !! propType.settings?.required;

	function calculateVisibility() {
		if ( ! isStyle || ! hasValue ) {
			return false;
		}

		if ( hasInitial ) {
			return ! isEqual( value, propType.initial_value );
		}

		return ! isRequired;
	}

	const visible = calculateVisibility();

	return {
		visible,
		title: __( 'Clear', 'elementor' ),
		icon: BrushBigIcon,
		onClick: () => resetValue(),
	};
}
