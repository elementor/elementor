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
import { getSectionCloseAttempt, type SectionCloseAttempts } from '../section-close-attempt';
import { DesignSystemHeaderMenu } from './design-system-header-menu';
import { DesignSystemHome } from './design-system-home';
import { DesignSystemSectionHeader } from './design-system-section-header';

export type DesignSystemPanelContentProps = {
	onRequestClose: () => void | Promise< void >;
};

const EVENT_SET_TAB = 'elementor/design-system/set-tab';
const EVENT_GO_HOME = 'elementor/design-system/go-home';

const INITIAL_SECTION_MOUNT_KEYS: Record< DesignSystemTab, number > = {
	defaults: 0,
	variables: 0,
	classes: 0,
};

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
	const [ sectionMountKeys, setSectionMountKeys ] = useState( INITIAL_SECTION_MOUNT_KEYS );
	const defaultsCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const variablesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const classesCloseAttemptRef = useRef< ( () => void ) | null >( null );
	const pendingExitActionRef = useRef< () => void >( () => {} );
	const sectionLeavingRef = useRef< DesignSystemTab | null >( null );
	const isChainingRef = useRef( false );
	const currentViewRef = useRef( currentView );

	useEffect( () => {
		currentViewRef.current = currentView;
	}, [ currentView ] );

	const bumpSectionMountKey = useCallback( ( section: DesignSystemTab ) => {
		setSectionMountKeys( ( keys ) => ( {
			...keys,
			[ section ]: keys[ section ] + 1,
		} ) );
	}, [] );

	const finalizeSectionExit = useCallback( () => {
		const leaving = sectionLeavingRef.current;
		if ( leaving ) {
			bumpSectionMountKey( leaving );
			sectionLeavingRef.current = null;
		}
		pendingExitActionRef.current();
	}, [ bumpSectionMountKey ] );

	const chainedThroughVariables = useCallback( () => {
		if ( ! isChainingRef.current && variablesCloseAttemptRef.current ) {
			isChainingRef.current = true;
			variablesCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		finalizeSectionExit();
	}, [ finalizeSectionExit ] );

	const chainedThroughClasses = useCallback( () => {
		if ( ! isChainingRef.current && classesCloseAttemptRef.current ) {
			isChainingRef.current = true;
			classesCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		finalizeSectionExit();
	}, [ finalizeSectionExit ] );

	const chainedThroughDefaults = useCallback( () => {
		if ( ! isChainingRef.current && defaultsCloseAttemptRef.current ) {
			isChainingRef.current = true;
			defaultsCloseAttemptRef.current();
			isChainingRef.current = false;
			return;
		}

		finalizeSectionExit();
	}, [ finalizeSectionExit ] );

	const goHome = useCallback( () => {
		setCurrentView( null );
		notifyDesignSystemViewChange( null );
	}, [] );

	const applyOpenSection = useCallback( ( tab: DesignSystemTab ) => {
		const normalized = normalizeDesignSystemTab( tab );
		setCurrentView( normalized );
		persistDesignSystemTab( normalized );
		notifyDesignSystemViewChange( normalized );
		trackDesignSystemSectionOpened( normalized );
	}, [] );

	const getCloseAttempts = (): SectionCloseAttempts => ( {
		defaults: defaultsCloseAttemptRef.current,
		variables: variablesCloseAttemptRef.current,
		classes: classesCloseAttemptRef.current,
	} );

	const requestOpenSection = useCallback(
		( tab: DesignSystemTab ) => {
			const normalized = normalizeDesignSystemTab( tab );
			const activeView = currentViewRef.current;

			if ( activeView === normalized ) {
				return;
			}

			const openSection = () => {
				applyOpenSection( normalized );
			};

			if ( ! activeView ) {
				openSection();
				return;
			}

			sectionLeavingRef.current = activeView;
			pendingExitActionRef.current = openSection;

			const closeAttempt = getSectionCloseAttempt( activeView, getCloseAttempts() );
			if ( closeAttempt ) {
				closeAttempt();
				return;
			}

			bumpSectionMountKey( activeView );
			openSection();
		},
		[ applyOpenSection, bumpSectionMountKey ]
	);

	const attemptBackFromSection = useCallback( () => {
		const activeView = currentViewRef.current;
		if ( ! activeView ) {
			return;
		}

		sectionLeavingRef.current = activeView;
		pendingExitActionRef.current = goHome;

		const closeAttempt = getSectionCloseAttempt( activeView, getCloseAttempts() );
		if ( closeAttempt ) {
			closeAttempt();
			return;
		}

		bumpSectionMountKey( activeView );
		goHome();
	}, [ bumpSectionMountKey, goHome ] );

	useEffect( () => {
		notifyDesignSystemViewChange( currentView );
	}, [ currentView ] );

	useEffect( () => {
		const setTabHandler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( ! tab ) {
				return;
			}
			requestOpenSection( tab );
		};

		const goHomeHandler = () => {
			if ( currentViewRef.current ) {
				attemptBackFromSection();
				return;
			}
			goHome();
		};

		window.addEventListener( EVENT_SET_TAB, setTabHandler as EventListener );
		window.addEventListener( EVENT_GO_HOME, goHomeHandler );

		return () => {
			window.removeEventListener( EVENT_SET_TAB, setTabHandler as EventListener );
			window.removeEventListener( EVENT_GO_HOME, goHomeHandler );
		};
	}, [ attemptBackFromSection, goHome, requestOpenSection ] );

	const preparePanelClose = useCallback( () => {
		sectionLeavingRef.current = null;
		pendingExitActionRef.current = () => {
			void onRequestClose();
		};
	}, [ onRequestClose ] );

	const startPanelCloseChain = useCallback( () => {
		preparePanelClose();

		if ( defaultsCloseAttemptRef.current ) {
			defaultsCloseAttemptRef.current();
			return;
		}

		if ( variablesCloseAttemptRef.current ) {
			variablesCloseAttemptRef.current();
			return;
		}

		if ( classesCloseAttemptRef.current ) {
			classesCloseAttemptRef.current();
			return;
		}

		void onRequestClose();
	}, [ onRequestClose, preparePanelClose ] );

	const handleHeaderClose = () => {
		if ( ! currentView ) {
			startPanelCloseChain();
			return;
		}

		preparePanelClose();

		const closeAttempt = getSectionCloseAttempt( currentView, getCloseAttempts() );
		if ( closeAttempt ) {
			closeAttempt();
			return;
		}

		void onRequestClose();
	};

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
							<DesignSystemHome onSelect={ requestOpenSection } />
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
								key={ sectionMountKeys.defaults }
								onRequestClose={ chainedThroughVariables }
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
								key={ sectionMountKeys.variables }
								onRequestClose={ chainedThroughClasses }
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
								key={ sectionMountKeys.classes }
								onRequestClose={ chainedThroughDefaults }
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