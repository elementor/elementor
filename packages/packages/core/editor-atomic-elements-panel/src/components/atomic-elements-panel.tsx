import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { Box, ErrorBoundary, Tab, Tabs, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { TILES_PER_ROW } from '../consts';
import { useAtomicWidgets } from '../hooks/use-atomic-widgets';
import { filterGroups } from '../utils/filter-groups';
import { getNavigationTarget } from '../utils/get-navigation-target';
import { getPromotionTiles } from '../utils/get-promotion-tiles';
import { groupWidgets } from '../utils/group-widgets';
import { AtomicPanelFallback } from './atomic-panel-fallback';
import { ElementGroup } from './element-group';
import { ElementsPanelSwitcher, type ElementsPanelSwitcherProps } from './elements-panel-switcher';
import { ElementsSearch } from './elements-search';

const ELEMENTS_TAB = 'elements';

const HEADER_SX = {
	justifyContent: 'space-between',
	boxSizing: 'border-box',
	height: 48,
	gap: 0,
	flexShrink: 0,
	borderBottom: 1,
	borderColor: 'divider',
};

const TITLE_SX = {
	flex: 1,
	textAlign: 'center',
	'&.MuiTypography-root': { fontSize: 15, fontWeight: 700, lineHeight: '15px' },
};

const TABS_SX = {
	flexShrink: 0,
	minHeight: 36,
	borderBottom: 1,
	borderColor: 'divider',
	'& .MuiTabs-indicator': { height: 3, backgroundColor: 'text.primary' },
	'& .MuiTab-root.MuiTab-root': {
		minHeight: 35,
		py: 0,
		fontSize: 12,
		fontWeight: 400,
		letterSpacing: 'normal',
		textTransform: 'none',
		color: 'text.secondary',
		'&.Mui-selected': { color: 'text.primary' },
	},
};

export function AtomicElementsPanel( props: Omit< ElementsPanelSwitcherProps, 'value' > ) {
	const widgets = useAtomicWidgets();
	const [ query, setQuery ] = useState( '' );
	const allGroups = groupWidgets( widgets, getPromotionTiles( widgets ) );
	const groups = filterGroups( allGroups, query );
	const isSearching = query.trim() !== '';

	const onKeyDown = ( event: React.KeyboardEvent< HTMLElement > ) => {
		const current = ( event.target as HTMLElement ).closest< HTMLElement >( '[data-nav-item]' );

		if ( ! current ) {
			return;
		}

		const target = getNavigationTarget( {
			items: Array.from( event.currentTarget.querySelectorAll< HTMLElement >( '[data-nav-item]' ) ),
			current,
			key: event.key,
			columns: TILES_PER_ROW,
			isRtl: getComputedStyle( current ).direction === 'rtl',
		} );

		if ( target ) {
			event.preventDefault();
			target.focus();
		}
	};

	return (
		<ErrorBoundary fallback={ <AtomicPanelFallback close={ props.close } /> }>
			<Panel>
				<PanelHeader sx={ HEADER_SX }>
					<PanelHeaderTitle sx={ TITLE_SX }>{ __( 'Add', 'elementor' ) }</PanelHeaderTitle>
					<Box sx={ { display: 'flex', alignItems: 'center', px: 1.5 } }>
						<ElementsPanelSwitcher value="atomic" { ...props } />
					</Box>
				</PanelHeader>
				<Tabs
					value={ ELEMENTS_TAB }
					variant="fullWidth"
					aria-label={ __( 'Elements panel tabs', 'elementor' ) }
					sx={ TABS_SX }
				>
					<Tab value={ ELEMENTS_TAB } label={ __( 'Elements', 'elementor' ) } />
					<Tab value="my-library" label={ __( 'My Library', 'elementor' ) } />
				</Tabs>
				<PanelBody sx={ { overflowY: 'auto' } } onKeyDown={ onKeyDown }>
					<ElementsSearch value={ query } onChange={ setQuery } groups={ groups } />
					<Box sx={ { px: 2 } }>
						{ groups.length === 0 ? (
							<Box sx={ { py: 4, textAlign: 'center' } }>
								<Typography variant="body2" color="text.secondary">
									{ isSearching
										? __(
												'No elements found. Clear the search or switch to the Legacy panel.',
												'elementor'
										  )
										: __( 'No atomic elements available.', 'elementor' ) }
								</Typography>
							</Box>
						) : (
							groups.map( ( group ) => <ElementGroup key={ group.id } group={ group } /> )
						) }
					</Box>
				</PanelBody>
			</Panel>
		</ErrorBoundary>
	);
}
