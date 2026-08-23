import * as React from 'react';
import { type SyntheticEvent, useCallback, useEffect, useRef, useState } from 'react';
import { DefaultStylesTabEmbedded } from '@elementor/editor-default-styles';
import { ClassManagerPanelEmbedded, trackGlobalClasses } from '@elementor/editor-global-classes';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { trackVariablesManagerEvent, VariablesManagerPanelEmbedded } from '@elementor/editor-variables';
import { ColorFilterIcon, ColorSwatchIcon, TextIcon } from '@elementor/icons';
import { Box, CloseButton, Divider, Stack, Tab, Tabs, useTabs } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { DEFAULT_STYLES_EXPERIMENT } from '../default-styles-experiment';
import {
	type DesignSystemTab,
	getInitialDesignSystemTab,
	normalizeDesignSystemTab,
	notifyDesignSystemTabChange,
	persistDesignSystemTab,
} from '../initial-tab';
import { DesignSystemHeaderMenu } from './design-system-header-menu';

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

const EVENT_SET_TAB = 'elementor/design-system/set-tab';

const trackDesignSystemTabOpened = ( tab: DesignSystemTab ) => {
	switch ( tab ) {
		case 'classes':
			trackGlobalClasses( { event: 'classManagerOpened', source: 'system-panel' } );
			break;
		case 'variables':
			trackVariablesManagerEvent( { action: 'openManager', source: 'system-panel' } );
			break;
	}
};

export function DesignSystemPanelContent( { onRequestClose }: DesignSystemPanelContentProps ) {
	const isDefaultStylesEnabled = isExperimentActive( DEFAULT_STYLES_EXPERIMENT );
	const [ currentTab, setCurrentTab ] = useState( () => getInitialDesignSystemTab() );
	const defaultsCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const variablesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const classesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const isChainingRef = useRef( false );
	const { getTabProps, getTabPanelProps, getTabsProps } = useTabs( currentTab );

	const chainedThroughClasses = useCallback( () => {
		if ( ! isChainingRef.current && classesCloseAttemptRef.current ) {
			isChainingRef.current = true;
			classesCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		void onRequestClose();
	}, [ onRequestClose ] );

	const chainedThroughVariables = useCallback( () => {
		if ( ! isChainingRef.current && variablesCloseAttemptRef.current ) {
			isChainingRef.current = true;
			variablesCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		void onRequestClose();
	}, [ onRequestClose ] );

	const chainedThroughDefaults = useCallback( () => {
		if ( isDefaultStylesEnabled && ! isChainingRef.current && defaultsCloseAttemptRef.current ) {
			isChainingRef.current = true;
			defaultsCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		void onRequestClose();
	}, [ isDefaultStylesEnabled, onRequestClose ] );

	useEffect( () => {
		notifyDesignSystemTabChange( currentTab );
	}, [ currentTab ] );

	useEffect( () => {
		const handler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( ! tab ) {
				return;
			}
			const normalizedTab = normalizeDesignSystemTab( tab );
			setCurrentTab( normalizedTab );
			persistDesignSystemTab( normalizedTab );
			notifyDesignSystemTabChange( normalizedTab );
			trackDesignSystemTabOpened( normalizedTab );
		};

		window.addEventListener( EVENT_SET_TAB, handler as EventListener );

		return () => {
			window.removeEventListener( EVENT_SET_TAB, handler as EventListener );
		};
	}, [] );

	const handleHeaderClose = () => {
		if ( currentTab === 'defaults' && isDefaultStylesEnabled && defaultsCloseAttemptRef.current ) {
			defaultsCloseAttemptRef.current();
			return;
		}

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
					<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center" spacing={ 0.5 }>
						<PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
							{ __( 'Design system', 'elementor' ) }
						</PanelHeaderTitle>
						<DesignSystemHeaderMenu />
						<CloseButton
							aria-label={ __( 'Close', 'elementor' ) }
							sx={ { flexShrink: 0 } }
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
								onChange={ ( e: SyntheticEvent, newValue: DesignSystemTab ) => {
									getTabsProps().onChange( e, newValue );
									setCurrentTab( newValue );
									persistDesignSystemTab( newValue );
									notifyDesignSystemTabChange( newValue );
									trackDesignSystemTabOpened( newValue );
								} }
							>
								{ isDefaultStylesEnabled ? (
									<Tab
										label={ __( 'Defaults', 'elementor' ) }
										icon={ <TextIcon fontSize="small" /> }
										iconPosition="start"
										{ ...getTabProps( 'defaults' ) }
									/>
								) : null }
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
						{ isDefaultStylesEnabled ? (
							<Box
								role="tabpanel"
								{ ...getTabPanelProps( 'defaults' ) }
								sx={ {
									flex: 1,
									minHeight: 0,
									display: currentTab === 'defaults' ? 'flex' : 'none',
									flexDirection: 'column',
									overflow: 'hidden',
									pt: 1,
								} }
							>
								<DefaultStylesTabEmbedded
									onRequestClose={ chainedThroughVariables }
									onExposeCloseAttempt={ ( fn ) => {
										defaultsCloseAttemptRef.current = fn;
									} }
								/>
							</Box>
						) : null }
						<Box
							role="tabpanel"
							{ ...getTabPanelProps( 'variables' ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: currentTab === 'variables' ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
								pt: 1,
							} }
						>
							<VariablesManagerPanelEmbedded
								onRequestClose={ chainedThroughClasses }
								onExposeCloseAttempt={ ( fn ) => {
									variablesCloseAttemptRef.current = fn;
								} }
							/>
						</Box>
						<Box
							role="tabpanel"
							{ ...getTabPanelProps( 'classes' ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: currentTab === 'classes' ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
								pt: 1,
							} }
						>
							<ClassManagerPanelEmbedded
								onRequestClose={
									isDefaultStylesEnabled ? chainedThroughDefaults : chainedThroughVariables
								}
								onExposeCloseAttempt={ ( fn ) => {
									classesCloseAttemptRef.current = fn;
								} }
								isActive={ currentTab === 'classes' }
							/>
						</Box>
					</Stack>
				</PanelBody>
			</Panel>
		</ThemeProvider>
	);
}
