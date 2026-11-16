import * as React from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, Button, Menu, MenuItem, useMediaQuery, usePopupState, useTheme } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type SecondaryBarLink } from '../types';

type Props = {
	addons: SecondaryBarLink[];
};

const itemSx = {
	py: '11px',
	px: '14px',
	typography: 'body2',
	'&&, &&:hover, &&:focus, &&:active, &&:visited': {
		color: 'text.primary',
		boxShadow: 'none',
	},
};

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
				disableRipple
				endIcon={ <ChevronDownIcon sx={ { fontSize: 14 } } /> }
				sx={ {
					height: 48,
					gap: 1,
					minWidth: 128,
					paddingInline: '20px 18px',
					borderRadius: 0,
					fontSize: 13,
					color: 'text.primary',
					fontWeight: 500,
					bgcolor: popupState.isOpen ? 'action.hover' : 'transparent',
					'&:hover': {
						bgcolor: 'transparent',
						color: 'text.primary',
					},
					'&[aria-expanded="true"]': {
						bgcolor: 'action.hover',
						color: 'text.primary',
					},
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
						minWidth: 236,
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
