import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';
import { isEqual } from './utils/is-equal';

const { registerAction } = controlActionsMenu;

const HIDDEN_RESET_RULES = [
	{ group: 'transition', bind: 'selection' },
	{ group: 'filter', bind: 'func' },
	{ group: 'backdrop-filter', bind: 'func' },
];

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, resetValue, propType, path, bind } = useBoundProp();
	const hasValue = value !== null && value !== undefined;
	const hasInitial = propType.initial_value !== undefined && propType.initial_value !== null;
	const isRequired = !! propType.settings?.required;

	const shouldHide = HIDDEN_RESET_RULES.some( rule => rule.group === path.at( 0 ) && rule.bind === bind );

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
