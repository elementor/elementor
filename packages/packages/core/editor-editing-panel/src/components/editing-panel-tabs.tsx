import { Fragment } from 'react';
import * as React from 'react';
import { useUserRestrictions } from '@elementor/editor-current-user';
import { getWidgetsCache } from '@elementor/editor-elements';
import { Divider, Stack, Tab, TabPanel, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useElement } from '../contexts/element-context';
import { ScrollProvider } from '../contexts/scroll-context';
import { useDefaultPanelSettings } from '../hooks/use-default-panel-settings';
import { useStateByElement } from '../hooks/use-state-by-element';
import { ContentOnlyInfotip } from './content-only-infotip';
import { InteractionsTab } from './interactions-tab';
import { SettingsTab } from './settings-tab';
import { stickyHeaderStyles, StyleTab } from './style-tab';

type TabValue = 'settings' | 'style' | 'interactions';

const CONTENT_ONLY_TAB: TabValue = 'settings';

const DESIGN_TABS: TabValue[] = [ 'style', 'interactions' ];

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
	const { element } = useElement();
	const editorDefaults = useDefaultPanelSettings();
	const defaultComponentTab = editorDefaults.defaultTab as TabValue;
	const isPromotedElement = !! getWidgetsCache()?.[ element.type ]?.meta?.is_pro_promotion;
	const { hasContentOnlyAccess } = useUserRestrictions();

	// A promoted element has no General tab, and its Style tab only renders an upsell, so restricting it would leave the panel empty.
	const areDesignTabsRestricted = hasContentOnlyAccess && ! isPromotedElement;

	const [ storedTab, setCurrentTab ] = useStateByElement< TabValue >( 'tab', defaultComponentTab );
	const currentTab = resolveCurrentTab( { storedTab, isPromotedElement, areDesignTabsRestricted } );
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs< TabValue >( currentTab );

	const getDesignTabProps = ( tab: TabValue ) => ( {
		...getTabProps( tab ),
		disabled: areDesignTabsRestricted,
		sx: areDesignTabsRestricted ? { pointerEvents: 'auto' } : undefined,
	} );

	const withRestrictionInfotip = ( label: string ) =>
		areDesignTabsRestricted ? <ContentOnlyInfotip>{ label }</ContentOnlyInfotip> : label;

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
							if ( areDesignTabsRestricted && DESIGN_TABS.includes( newValue ) ) {
								return;
							}

							getTabsProps().onChange( _, newValue );
							setCurrentTab( newValue );
						} }
					>
						{ ! isPromotedElement && (
							<Tab label={ __( 'General', 'elementor' ) } { ...getTabProps( 'settings' ) } />
						) }
						<Tab
							label={ withRestrictionInfotip( __( 'Style', 'elementor' ) ) }
							{ ...getDesignTabProps( 'style' ) }
						/>
						<Tab
							label={ withRestrictionInfotip( __( 'Interactions', 'elementor' ) ) }
							{ ...getDesignTabProps( 'interactions' ) }
						/>
					</Tabs>
					<Divider />
				</Stack>
				{ ! isPromotedElement && (
					<TabPanel { ...getTabPanelProps( 'settings' ) } disablePadding>
						<SettingsTab />
					</TabPanel>
				) }
				{ ! areDesignTabsRestricted && (
					<>
						<TabPanel { ...getTabPanelProps( 'style' ) } disablePadding>
							<StyleTab />
						</TabPanel>
						<TabPanel { ...getTabPanelProps( 'interactions' ) } disablePadding>
							<InteractionsTab />
						</TabPanel>
					</>
				) }
			</Stack>
		</ScrollProvider>
	);
};

const resolveCurrentTab = ( {
	storedTab,
	isPromotedElement,
	areDesignTabsRestricted,
}: {
	storedTab: TabValue;
	isPromotedElement: boolean;
	areDesignTabsRestricted: boolean;
} ): TabValue => {
	if ( areDesignTabsRestricted && DESIGN_TABS.includes( storedTab ) ) {
		return CONTENT_ONLY_TAB;
	}

	if ( isPromotedElement && storedTab === 'settings' ) {
		return 'style';
	}

	return storedTab;
};
