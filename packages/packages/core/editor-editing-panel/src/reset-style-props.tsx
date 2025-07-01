import { useBoundProp } from '@elementor/editor-controls';
import { BrushBigIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { useIsStyle } from './contexts/style-context';
import { controlActionsMenu } from './controls-actions';

const { registerAction } = controlActionsMenu;

export function initResetStyleProps() {
	registerAction( {
		id: 'reset-style-value',
		useProps: useResetStyleValueProps,
	} );
}

// Temporary fix for the issue with ControlToggleButtonGroup.
const EXCLUDED_BINDS = [ 'flex-grow', 'flex-shrink', 'flex-basis' ];

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, setValue, path, bind } = useBoundProp();

	return {
		visible:
			isStyle && value !== null && value !== undefined && path.length <= 2 && ! EXCLUDED_BINDS.includes( bind ),
		title: __( 'Clear', 'elementor' ),
		icon: BrushBigIcon,
		onClick: () => setValue( null ),
	};
}
