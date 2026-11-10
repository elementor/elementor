import * as React from 'react';
import { Link, Stack } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { type SecondaryBarConfig } from '../types';
import { AddonsMenu } from './addons-menu';
import { FinderButton } from './finder-button';

type Props = {
	config: SecondaryBarConfig;
};

const getTabSx = ( isActive: boolean ) => {
	const boxShadow = isActive ? 'inset 0 -3px 0 currentColor' : 'none';
	const color = isActive ? 'text.primary' : 'text.secondary';

	return {
		display: 'inline-flex',
		alignItems: 'center',
		flexShrink: 0,
		px: 2,
		whiteSpace: 'nowrap',
		typography: 'body2',
		color,
		fontWeight: isActive ? 'fontWeightMedium' : 'fontWeightRegular',
		boxShadow,
		'&:visited': {
			color,
		},
		'&:hover, &:focus, &:active': {
			color: 'text.primary',
			boxShadow,
		},
		'&:focus-visible': {
			outline: '2px solid',
			outlineOffset: '-2px',
		},
	};
};

export function SecondaryBar( { config }: Props ) {
	/* translators: %s: Admin section name. */
	const navLabel = sprintf( __( '%s section', 'elementor' ), config.label );

	return (
		<Stack
			component="nav"
			direction="row"
			sx={ {
				height: 48,
				borderBlockEnd: '1px solid',
				borderColor: 'divider',
				bgcolor: 'background.paper',
			} }
			aria-label={ navLabel }
		>
			<Stack direction="row" sx={ { flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' } }>
				{ config.tabs.map( ( tab ) => (
					<Link
						key={ tab.id }
						href={ tab.url }
						underline="none"
						aria-current={ tab.is_active ? 'page' : undefined }
						sx={ getTabSx( tab.is_active ) }
					>
						{ tab.label }
					</Link>
				) ) }
			</Stack>
			<Stack alignItems="stretch" direction="row" sx={ { flexShrink: 0 } }>
				{ config.addons.length > 0 && <AddonsMenu addons={ config.addons } /> }
				{ config.is_finder_available && (
					<FinderButton showLeadingDivider={ config.addons.length > 0 } />
				) }
			</Stack>
		</Stack>
	);
}
