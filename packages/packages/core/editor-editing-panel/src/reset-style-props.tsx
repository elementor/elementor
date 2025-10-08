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
	const { value, setValue, propType } = useBoundProp();

	const getResetValue = () => {
		if ( propType?.default !== null && propType?.default !== undefined ) {
			return propType.default;
		}

		return null;
	};

	return {
		visible: isStyle && value !== null && value !== undefined && ! areValuesEqual( value, propType?.default ),
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
