import * as React from 'react';
import { Fragment } from 'react';
import { Divider, Stack, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { ScrollProvider } from '../contexts/scroll-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { useStateByElement } from '../hooks/use-state-by-element';
import { SettingsTab } from './settings-tab';
import { stickyHeaderStyles, StyleTab } from './style-tab';

type TabValue = 'settings' | 'style';

export const EditingPanelTabs = () => {
	const { element } = useElement();
	return (
		// When switching between elements, the local states should be reset. We are using key to rerender the tabs.
		// Reference: https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key
		<Fragment key={ element.id }>
			<PanelTabContent />
		</Fragment>
	);
};

const PanelTabContent = () => {
	const editorDefaults = useDefaultPanelSettings();
	const defaultComponentTab = editorDefaults.defaultTab as TabValue;

	const [ currentTab, setCurrentTab ] = useStateByElement< TabValue >( 'tab', defaultComponentTab );
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
						<Tab label={ __( 'General', 'elementor' ) } { ...getTabProps( 'settings' ) } />
						<Tab label={ __( 'Style', 'elementor' ) } { ...getTabProps( 'style' ) } />
					</Tabs>
					<Divider />
				</Stack>
				<TabPanel { ...getTabPanelProps( 'settings' ) } disablePadding>
					<SettingsTab />
				</TabPanel>
				<TabPanel { ...getTabPanelProps( 'style' ) } disablePadding>
					<StyleTab />
				</TabPanel>
			</Stack>
		</ScrollProvider>
	);
};
