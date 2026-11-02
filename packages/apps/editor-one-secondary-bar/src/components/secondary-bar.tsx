import * as React from 'react';
import { Stack, Tab, Tabs } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { type SecondaryBarConfig } from '../types';
import { AddonsMenu } from './addons-menu';
import { FinderButton } from './finder-button';

type Props = {
	config: SecondaryBarConfig;
};

const prefersReducedMotion = (): boolean =>
	typeof window !== 'undefined' && Boolean( window.matchMedia?.( '(prefers-reduced-motion: reduce)' ).matches );

const tabSx = {
	color: 'text.secondary',
	'&:hover, &:focus, &:active': {
		color: 'text.primary',
		boxShadow: 'none',
	},
	'&.Mui-selected': {
		color: 'text.primary',
		fontWeight: 'fontWeightMedium',
	},
	'&.Mui-focusVisible': {
		outline: '2px solid',
		outlineOffset: '-2px',
	},
};

export function SecondaryBar( { config }: Props ) {
	const activeIndex = config.tabs.findIndex( ( tab ) => tab.is_active );
	const reduceMotion = prefersReducedMotion();

	/* translators: %s: Admin section name. */
	const navLabel = sprintf( __( '%s section', 'elementor' ), config.label );

	return (
		<Stack component="nav" direction="row" alignItems="stretch" sx={ { height: '100%' } } aria-label={ navLabel }>
			<Tabs
				value={ activeIndex < 0 ? false : activeIndex }
				variant="scrollable"
				scrollButtons={ false }
				sx={ { flex: 1, minWidth: 0 } }
				TabIndicatorProps={ {
					sx: {
						height: '3px',
						backgroundColor: 'text.primary',
						...( reduceMotion && { transition: 'none' } ),
					},
				} }
			>
				{ config.tabs.map( ( tab ) => (
					<Tab
						key={ tab.id }
						label={ tab.label }
						sx={ tabSx }
						component="a"
						href={ tab.url }
						aria-current={ tab.is_active ? 'page' : undefined }
					/>
				) ) }
			</Tabs>
			{ config.addons.length > 0 && <AddonsMenu addons={ config.addons } reduceMotion={ reduceMotion } /> }
			<FinderButton />
		</Stack>
	);
}
