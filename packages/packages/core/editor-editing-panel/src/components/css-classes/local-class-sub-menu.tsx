import * as React from 'react';
import { MenuSubheader, type PopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { CssClassConvert } from './css-class-convert-local';
import { useCanConvertLocalClassToGlobal } from './use-can-convert-local-class-to-global';

type OwnProps = {
	popupState: PopupState;
};

export const LocalClassSubMenu = ( props: OwnProps ) => {
	const { canConvert, styleDef } = useCanConvertLocalClassToGlobal();

	return (
		<>
			<MenuSubheader sx={ { typography: 'caption', color: 'text.secondary', pb: 0.5, pt: 1 } }>
				{ __( 'Local Class', 'elementor' ) }
			</MenuSubheader>
			<CssClassConvert canConvert={ canConvert } styleDef={ styleDef } closeMenu={ props.popupState.close } />
		</>
	);
};
