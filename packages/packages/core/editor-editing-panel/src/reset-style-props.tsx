import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';
import { isEqual } from './utils/is-equal';

const { registerAction } = controlActionsMenu;

function shouldHideResetButton( path: string[], position: number, controlName: string, repeaterName: string ) {
	return path.at( position ) === controlName && path.includes( repeaterName );
}

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, resetValue, propType, path } = useBoundProp();
	const hasValue = value !== null && value !== undefined;
	const hasInitial = propType.initial_value !== undefined && propType.initial_value !== null;
	const isRequired = !! propType.settings?.required;

	const isTransitionTypeControl = shouldHideResetButton( path, -1, 'selection', 'transition' );
	const isFilterControlOrBackdropFilterControl =
		shouldHideResetButton( path, -2, 'css-filter-func', 'backdrop-filter' ) ||
		shouldHideResetButton( path, -2, 'css-filter-func', 'filter' );
	const shouldHide = isTransitionTypeControl || isFilterControlOrBackdropFilterControl;

	function calculateVisibility() {
		if ( ! isStyle || ! hasValue || shouldHide ) {
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
