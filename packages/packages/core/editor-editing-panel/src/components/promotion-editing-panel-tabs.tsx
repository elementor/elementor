import { Fragment } from 'react';
import * as React from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Divider, Stack, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { ScrollProvider } from '../contexts/scroll-context';
import { useStateByElement } from '../hooks/use-state-by-element';
import { InteractionsTab } from './interactions-tab';
import { stickyHeaderStyles, StyleTab } from './style-tab';

type TabValue = 'style' | 'interactions';

export const PromotionEditingPanelTabs = () => {
	const { element } = useElement();
	return (
		<Fragment key={ element.id }>
			<PromotionPanelTabContent />
		</Fragment>
	);
};

const PromotionPanelTabContent = () => {
	const isInteractionsActive = isExperimentActive( 'e_interactions' );

	const [ currentTab, setCurrentTab ] = useStateByElement< TabValue >( 'tab', 'style' );
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs< TabValue >( currentTab );
	return (
		<ScrollProvider>
			<Stack direction="column" sx={ { width: '100%' } }>
				<Stack sx={ { ...stickyHeaderStyles, top: 0 } }>
					<Tabs
						variant="fullWidth"
						size="small"
						sx={ { mt: 0.5 } }
						{ ...getTabsProps() }
						onChange={ ( _: unknown, newValue: TabValue ) => {
							getTabsProps().onChange( _, newValue );
							setCurrentTab( newValue );
						} }
					>
						<Tab label={ __( 'Style', 'elementor' ) } { ...getTabProps( 'style' ) } />
						{ isInteractionsActive && (
							<Tab label={ __( 'Interactions', 'elementor' ) } { ...getTabProps( 'interactions' ) } />
						) }
					</Tabs>
					<Divider />
				</Stack>
				<TabPanel { ...getTabPanelProps( 'style' ) } disablePadding>
					<StyleTab />
				</TabPanel>
				{ isInteractionsActive && (
					<TabPanel { ...getTabPanelProps( 'interactions' ) } disablePadding>
						<InteractionsTab />
					</TabPanel>
				) }
			</Stack>
		</ScrollProvider>
	);
};
