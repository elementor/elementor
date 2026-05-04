import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ClassManagerPanelEmbedded } from '@elementor/editor-global-classes';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { VariablesManagerPanelEmbedded } from '@elementor/editor-variables';
import { ColorFilterIcon, ColorSwatchIcon } from '@elementor/icons';
import { Box, CloseButton, Divider, Stack, Tab, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	type DesignSystemTab,
	getInitialDesignSystemTab,
	notifyDesignSystemTabChange,
	persistDesignSystemTab,
} from '../initial-tab';

const stickyTabRowStyles = {
	position: 'sticky' as const,
	zIndex: 1100,
	opacity: 1,
	backgroundColor: 'background.default' as const,
	transition: 'top 300ms ease' as const,
};

export type DesignSystemPanelContentProps = {
	onRequestClose: () => void | Promise< void >;
};

export function DesignSystemPanelContent( { onRequestClose }: DesignSystemPanelContentProps ) {
	const [ currentTab, setCurrentTab ] = useState( () => getInitialDesignSystemTab() );
	const variablesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const classesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs( currentTab );

	useEffect( () => {
		notifyDesignSystemTabChange( currentTab );
	}, [ currentTab ] );

	useEffect( () => {
		const handler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( ! tab ) {
				return;
			}
			setCurrentTab( tab );
			persistDesignSystemTab( tab );
		};

		window.addEventListener( 'elementor/design-system/set-tab', handler as EventListener );

		return () => {
			window.removeEventListener( 'elementor/design-system/set-tab', handler as EventListener );
		};
	}, [] );

	const handleHeaderClose = () => {
		if ( currentTab === 'variables' && variablesCloseAttemptRef.current ) {
			variablesCloseAttemptRef.current();
			return;
		}

		if ( currentTab === 'classes' && classesCloseAttemptRef.current ) {
			classesCloseAttemptRef.current();
			return;
		}

		void onRequestClose();
	};

	return (
		<ThemeProvider>
			<Panel>
				<PanelHeader>
					<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
						<PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
							{ __( 'Design system', 'elementor' ) }
						</PanelHeaderTitle>
						<CloseButton
							aria-label={ __( 'Close', 'elementor' ) }
							sx={ { flexShrink: 0, marginLeft: 'auto' } }
							onClick={ () => void handleHeaderClose() }
						/>
					</Stack>
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
								onChange={ ( e: React.SyntheticEvent, newValue: DesignSystemTab ) => {
									getTabsProps().onChange( e, newValue );
									setCurrentTab( newValue );
									persistDesignSystemTab( newValue );
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
								pt: 1,
							} }
						>
							{ currentTab === 'variables' && (
								<VariablesManagerPanelEmbedded
									onRequestClose={ onRequestClose }
									onExposeCloseAttempt={ ( fn ) => {
										variablesCloseAttemptRef.current = fn;
									} }
								/>
							) }
							{ currentTab === 'classes' && (
								<ClassManagerPanelEmbedded
									onRequestClose={ onRequestClose }
									onExposeCloseAttempt={ ( fn ) => {
										classesCloseAttemptRef.current = fn;
									} }
								/>
							) }
						</Box>
					</Stack>
				</PanelBody>
			</Panel>
		</ThemeProvider>
	);
}
