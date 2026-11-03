import * as React from 'react';
import {
	bindMenu,
	bindTrigger,
	Button,
	Menu,
	MenuItem,
	SvgIcon,
	useMediaQuery,
	usePopupState,
	useTheme,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type SecondaryBarLink } from '../types';

type Props = {
	addons: SecondaryBarLink[];
};

const itemSx = {
	py: 1,
	px: 2,
	typography: 'body2',
	'&&, &&:hover, &&:focus, &&:active, &&:visited': {
		color: 'info.main',
		boxShadow: 'none',
	},
};

const CaretIcon = () => (
	<SvgIcon viewBox="0 0 24 24" fontSize="tiny">
		<path d="M6 9h12l-6 7z" />
	</SvgIcon>
);

export function AddonsMenu( { addons }: Props ) {
	const theme = useTheme();
	const reduceMotion = useMediaQuery( '(prefers-reduced-motion: reduce)' );
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'editor-one-secondary-bar-addons',
	} );

	const horizontal = 'rtl' === theme.direction ? 'left' : 'right';

	return (
		<>
			<Button
				color="secondary"
				endIcon={ <CaretIcon /> }
				sx={ {
					px: 4,
					borderRadius: 0,
					color: 'text.primary',
					fontWeight: 'fontWeightRegular',
					bgcolor: popupState.isOpen ? 'action.hover' : 'transparent',
				} }
				{ ...bindTrigger( popupState ) }
			>
				{ __( 'Addons', 'elementor' ) }
			</Button>
			<Menu
				{ ...bindMenu( popupState ) }
				anchorOrigin={ { vertical: 'bottom', horizontal } }
				transformOrigin={ { vertical: 'top', horizontal } }
				transitionDuration={ reduceMotion ? 0 : 'auto' }
				PaperProps={ {
					sx: {
						mt: '1px',
						minWidth: 208,
						maxHeight: 340,
						borderRadius: 0,
						boxShadow: '0 8px 24px rgba(12, 13, 14, 0.12)',
					},
				} }
			>
				{ addons.map( ( addon ) => (
					<MenuItem key={ addon.id } component="a" href={ addon.url } sx={ itemSx }>
						{ addon.label }
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
}
