import { useBoundProp } from '@elementor/editor-controls';
import { hasVariable } from '@elementor/editor-variables';
import { type TransformablePropValue } from '@elementor/editor-props';
import { BrushBigIcon } from '@elementor/icons';
import { controlActionsMenu } from '@elementor/menus';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
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
	const shouldHide = !! propType.settings?.hide_reset;
	const isPropTypeValue = value as TransformablePropValue<string, string>;
	const variableExists = isPropTypeValue?.$$type?.includes('variable') && hasVariable(isPropTypeValue?.value);

	function calculateVisibility() {
		if ( ! isStyle || ! hasValue || shouldHide || ! variableExists ) {
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
