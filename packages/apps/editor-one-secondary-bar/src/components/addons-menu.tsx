import * as React from 'react';
import { ChevronDownIcon } from '@elementor/icons';
import { bindMenu, bindTrigger, Button, Menu, MenuItem, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type SecondaryBarLink } from '../types';

type Props = {
	addons: SecondaryBarLink[];
	reduceMotion: boolean;
};

export function AddonsMenu( { addons, reduceMotion }: Props ) {
	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'editor-one-secondary-bar-addons',
	} );

	return (
		<>
			<Button color="secondary" endIcon={ <ChevronDownIcon fontSize="tiny" /> } { ...bindTrigger( popupState ) }>
				{ __( 'Addons', 'elementor' ) }
			</Button>
			<Menu
				{ ...bindMenu( popupState ) }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: 'right' } }
				transitionDuration={ reduceMotion ? 0 : 'auto' }
			>
				{ addons.map( ( addon ) => (
					<MenuItem key={ addon.url } component="a" href={ addon.url }>
						{ addon.label }
					</MenuItem>
				) ) }
			</Menu>
		</>
	);
}
