import * as React from 'react';
import { useState } from 'react';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { ColorFilterIcon, ColorSwatchIcon } from '@elementor/icons';
import { Box, Divider, Stack, Tab, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { consumeInitialDesignSystemTab, type DesignSystemTab } from '../initial-tab';

type TabValue = DesignSystemTab;

/** Matches the editing panel tab strip (`editing-panel-tabs` / `style-tab` sticky row). */
const stickyTabRowStyles = {
	position: 'sticky' as const,
	zIndex: 1100,
	opacity: 1,
	backgroundColor: 'background.default' as const,
	transition: 'top 300ms ease' as const,
};

/**
 * Shell only: panel chrome + design-system title + tab strip. Tab bodies are delegated to
 * `@elementor/editor-variables` and `@elementor/editor-global-classes` unchanged — use a **single**
 * content mount so a hidden `TabPanel` does not keep an empty flex child (which caused the large
 * empty gap in the Classes tab next to a sibling with `flex: 1`).
 * @param root0
 * @param root0.onRequestClose
 */
export function DesignSystemPanelContent() {
	const [ currentTab, setCurrentTab ] = useState( () => consumeInitialDesignSystemTab() );
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs( currentTab );

	return (
		<ThemeProvider>
			<Panel>
				<PanelHeader>
					<PanelHeaderTitle>{ __( 'Design system', 'elementor' ) }</PanelHeaderTitle>
				</PanelHeader>
				<PanelBody
					sx={ {
						display: 'flex',
						flexDirection: 'column',
						height: '100%',
						overflow: 'hidden',
						minHeight: 0,
					} }
				>
					<Stack direction="column" sx={ { width: '100%', flex: 1, minHeight: 0, overflow: 'hidden' } }>
						<Stack sx={ { ...stickyTabRowStyles, top: 0, flexShrink: 0 } }>
							<Tabs
								variant="fullWidth"
								size="small"
								sx={ { mt: 0.5 } }
								{ ...getTabsProps() }
								onChange={ ( e: React.SyntheticEvent, newValue: TabValue ) => {
									getTabsProps().onChange( e, newValue );
									setCurrentTab( newValue );
								} }
							>
								<Tab
									label={ __( 'Variables', 'elementor' ) }
									icon={ <ColorFilterIcon fontSize="small" /> }
									iconPosition="start"
									{ ...getTabProps( 'variables' ) }
								/>
								<Tab
									label={ __( 'Classes', 'elementor' ) }
									icon={ <ColorSwatchIcon fontSize="small" /> }
									iconPosition="start"
									{ ...getTabProps( 'classes' ) }
								/>
							</Tabs>
							<Divider />
						</Stack>
						<Box
							role="tabpanel"
							{ ...getTabPanelProps( currentTab ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: 'flex',
								flexDirection: 'column',
								overflow: 'hidden',
							} }
						></Box>
					</Stack>
				</PanelBody>
			</Panel>
		</ThemeProvider>
	);
}
