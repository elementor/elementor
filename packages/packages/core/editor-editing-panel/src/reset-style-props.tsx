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

export function useResetStyleValueProps() {
	const isStyle = useIsStyle();
	const { value, setValue, path } = useBoundProp();

	return {
		visible: isStyle && value !== null && value !== undefined && path.length <= 2,
		title: __( 'Clear', 'elementor' ),
		icon: BrushBigIcon,
		onClick: () => setValue( null ),
	};
}
