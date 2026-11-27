import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DefaultStylesTabEmbedded, trackDefaultStyles } from '@elementor/editor-default-styles';
import { ClassManagerPanelEmbedded, trackGlobalClasses } from '@elementor/editor-global-classes';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { isSidebarEnabled } from '@elementor/editor-sidebar';
import { ThemeProvider } from '@elementor/editor-ui';
import { trackVariablesManagerEvent, VariablesManagerPanelEmbedded } from '@elementor/editor-variables';
import { Box, CloseButton, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	type DesignSystemTab,
	type DesignSystemView,
	getInitialDesignSystemView,
	normalizeDesignSystemTab,
	notifyDesignSystemViewChange,
	persistDesignSystemTab,
} from '../initial-tab';
import { DesignSystemHeaderMenu } from './design-system-header-menu';
import { DesignSystemHome } from './design-system-home';
import { DesignSystemSectionHeader } from './design-system-section-header';

export type DesignSystemPanelContentProps = {
	onRequestClose: () => void | Promise< void >;
};

const EVENT_SET_TAB = 'elementor/design-system/set-tab';
const EVENT_GO_HOME = 'elementor/design-system/go-home';

const trackDesignSystemSectionOpened = ( tab: DesignSystemTab ) => {
	switch ( tab ) {
		case 'defaults':
			trackDefaultStyles( { event: 'panelOpened' } );
			break;
		case 'classes':
			trackGlobalClasses( { event: 'classManagerOpened', source: 'system-panel' } );
			break;
		case 'variables':
			trackVariablesManagerEvent( { action: 'openManager', source: 'system-panel' } );
			break;
	}
};

export function DesignSystemPanelContent( { onRequestClose }: DesignSystemPanelContentProps ) {
	const sidebarPanelChrome = isSidebarEnabled();
	const [ currentView, setCurrentView ] = useState< DesignSystemView >( () => getInitialDesignSystemView() );
	const defaultsCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const variablesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const classesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const sectionExitActionRef = useRef< () => void >( () => {} );

	const goHome = useCallback( () => {
		setCurrentView( null );
		notifyDesignSystemViewChange( null );
	}, [] );

	const openSection = useCallback( ( tab: DesignSystemTab ) => {
		const normalized = normalizeDesignSystemTab( tab );
		setCurrentView( normalized );
		persistDesignSystemTab( normalized );
		notifyDesignSystemViewChange( normalized );
		trackDesignSystemSectionOpened( normalized );
	}, [] );

	const attemptBackFromSection = useCallback( () => {
		if ( ! currentView ) {
			return;
		}

		const closeAttempt =
			currentView === 'defaults'
				? defaultsCloseAttemptRef.current
				: currentView === 'variables'
					? variablesCloseAttemptRef.current
					: classesCloseAttemptRef.current;

		sectionExitActionRef.current = goHome;
		if ( closeAttempt ) {
			closeAttempt();
			return;
		}

		goHome();
	}, [ currentView, goHome ] );

	useEffect( () => {
		notifyDesignSystemViewChange( currentView );
	}, [ currentView ] );

	useEffect( () => {
		const setTabHandler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( ! tab ) {
				return;
			}
			openSection( tab );
		};

		const goHomeHandler = () => {
			goHome();
		};

		window.addEventListener( EVENT_SET_TAB, setTabHandler as EventListener );
		window.addEventListener( EVENT_GO_HOME, goHomeHandler );

		return () => {
			window.removeEventListener( EVENT_SET_TAB, setTabHandler as EventListener );
			window.removeEventListener( EVENT_GO_HOME, goHomeHandler );
		};
	}, [ goHome, openSection ] );

	const handleHeaderClose = () => {
		if ( ! currentView ) {
			void onRequestClose();
			return;
		}

		const closeAttempt =
			currentView === 'defaults'
				? defaultsCloseAttemptRef.current
				: currentView === 'variables'
					? variablesCloseAttemptRef.current
					: classesCloseAttemptRef.current;

		sectionExitActionRef.current = () => {
			void onRequestClose();
		};
		if ( closeAttempt ) {
			closeAttempt();
			return;
		}

		void onRequestClose();
	};

	const handleSectionRequestClose = useCallback( () => {
		sectionExitActionRef.current();
	}, [] );

	const showHome = currentView === null;

	return (
		<ThemeProvider>
			<Panel>
				<PanelHeader>
					<Stack
						width="100%"
						direction="row"
						alignItems="center"
						spacing={ 0.5 }
						sx={ sidebarPanelChrome ? undefined : { p: 1, pl: 2 } }
					>
						{ showHome ? (
							<PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
								{ __( 'Design system', 'elementor' ) }
							</PanelHeaderTitle>
						) : (
							<DesignSystemSectionHeader section={ currentView } onBack={ attemptBackFromSection } />
						) }
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
						<Box
							sx={ {
								flex: 1,
								minHeight: 0,
								display: showHome ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
							} }
						>
							<DesignSystemHome onSelect={ openSection } />
						</Box>
						<Box
							role="region"
							aria-label={ __( 'Default Styles', 'elementor' ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: currentView === 'defaults' ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
								pt: 1,
							} }
						>
							<DefaultStylesTabEmbedded
								onRequestClose={ handleSectionRequestClose }
								onExposeCloseAttempt={ ( fn ) => {
									defaultsCloseAttemptRef.current = fn;
								} }
							/>
						</Box>
						<Box
							role="region"
							aria-label={ __( 'Variables Manager', 'elementor' ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: currentView === 'variables' ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
								pt: 1,
							} }
						>
							<VariablesManagerPanelEmbedded
								onRequestClose={ handleSectionRequestClose }
								onExposeCloseAttempt={ ( fn ) => {
									variablesCloseAttemptRef.current = fn;
								} }
							/>
						</Box>
						<Box
							role="region"
							aria-label={ __( 'Classes Manager', 'elementor' ) }
							sx={ {
								flex: 1,
								minHeight: 0,
								display: currentView === 'classes' ? 'flex' : 'none',
								flexDirection: 'column',
								overflow: 'hidden',
								pt: 1,
							} }
						>
							<ClassManagerPanelEmbedded
								onRequestClose={ handleSectionRequestClose }
								onExposeCloseAttempt={ ( fn ) => {
									classesCloseAttemptRef.current = fn;
								} }
							/>
						</Box>
					</Stack>
				</PanelBody>
			</Panel>
		</ThemeProvider>
	);
}