import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getMixpanel } from '@elementor/events';
import { Box } from '@elementor/ui';

import type { ConnectSuccessData } from '../analytics';
import { canSendEvents, initializeAndEnableTracking, setCanSendEvents, updateLibraryConnectConfig } from '../analytics';
import { useCheckProInstallScreen } from '../hooks/use-check-pro-install-screen';
import { useElementorConnect } from '../hooks/use-elementor-connect';
import { useInstallTheme } from '../hooks/use-install-theme';
import { useOnboarding } from '../hooks/use-onboarding';
import { useOnboardingEvent } from '../hooks/use-onboarding-event';
import { useUpdateChoices } from '../hooks/use-update-choices';
import { useUpdateProgress } from '../hooks/use-update-progress';
import { useVideoPreload } from '../hooks/use-video-preload';
import { BuildingFor } from '../steps/screens/building-for';
import { ExperienceLevel } from '../steps/screens/experience-level';
import { Login } from '../steps/screens/login';
import { ProInstall } from '../steps/screens/pro-install';
import { SiteAbout } from '../steps/screens/site-about';
import { SiteFeatures } from '../steps/screens/site-features';
import { ThemeSelection } from '../steps/screens/theme-selection';
import { getStepVisualConfig } from '../steps/step-visuals';
import { StepId } from '../types';
import { t } from '../utils/translations';
import { useToast } from './toast/toast-context';
import { BaseLayout } from './ui/base-layout';
import { Footer } from './ui/footer';
import { FooterActions } from './ui/footer-actions';
import { SplitLayout } from './ui/split-layout';
import { TopBar } from './ui/top-bar';
import { TopBarContent } from './ui/top-bar-content';

const isChoiceEmpty = ( choice: unknown ): boolean => {
	return choice === null || choice === undefined || ( Array.isArray( choice ) && choice.length === 0 );
};

const isContinueDisabled = ( stepId: string | null, isLast: boolean, choiceForStep: unknown ): boolean => {
	if ( stepId === StepId.THEME_SELECTION ) {
		return false;
	}

	if ( isLast ) {
		return false;
	}

	return isChoiceEmpty( choiceForStep );
};

interface AppContentProps {
	onClose?: () => void;
}

export function AppContent( { onClose }: AppContentProps ) {
	const {
		stepId,
		stepIndex,
		isFirst,
		isLast,
		totalSteps,
		resumeStepIdForTracking,
		isLoading,
		isConnected,
		hasPassedLogin,
		shouldShowProInstall,
		choices,
		completedSteps,
		urls,
		actions,
		isGuest,
	} = useOnboarding();

	const { showToast } = useToast();

	useVideoPreload();

	const updateProgress = useUpdateProgress();
	const updateChoices = useUpdateChoices();
	const installTheme = useInstallTheme();

	const {
		trackOnboardingInitialized,
		trackLoginType,
		trackConnect,
		trackStepViewed,
		trackProFeaturesSelected,
		trackBackClicked,
		trackSkipClicked,
		trackUpgradeClicked,
		trackResumeOnboarding,
		trackSummary,
		trackErrorReported,
		activateTracking,
		flushQueue,
	} = useOnboardingEvent();

	const hasTrackedInit = useRef( false );
	const isCompletingRef = useRef( false );

	useEffect( () => {
		if ( ! hasTrackedInit.current ) {
			hasTrackedInit.current = true;
			trackOnboardingInitialized();

			if ( resumeStepIdForTracking ) {
				trackResumeOnboarding( resumeStepIdForTracking );
				actions.clearResumeStepIdForTracking();
			} else {
				trackStepViewed( 'login' );
			}
			return;
		}

		if ( hasPassedLogin && stepId && ! isCompletingRef.current ) {
			trackStepViewed( stepId );
		}
	}, [
		stepId,
		resumeStepIdForTracking,
		hasPassedLogin,
		actions,
		trackOnboardingInitialized,
		trackResumeOnboarding,
		trackStepViewed,
	] );

	const checkProInstallScreen = useCheckProInstallScreen();

	const handleConnectSuccess = useCallback(
		async ( data: ConnectSuccessData ) => {
			trackConnect( true );
			trackLoginType( 'elementor_login' );

			const shouldEnableTracking = data.tracking_opted_in || canSendEvents();

			if ( data.tracking_opted_in ) {
				setCanSendEvents( true );
			}

			if ( shouldEnableTracking ) {
				initializeAndEnableTracking( ( mp ) => {
					( mp as { set_config?: ( c: object ) => void } )?.set_config?.( {
						api_transport: 'sendbeacon',
					} );
					activateTracking();
					flushQueue();
				} );
			}

			updateLibraryConnectConfig( data );

			const result = await checkProInstallScreen();
			actions.setShouldShowProInstallScreen( result.shouldShowProInstallScreen );
			actions.setConnected( true );
		},
		[ actions, checkProInstallScreen, trackConnect, trackLoginType, activateTracking, flushQueue ]
	);

	const handleConnect = useElementorConnect( {
		connectUrl: urls.connect,
		onSuccess: handleConnectSuccess,
	} );

	function handleContinueAsGuest( event: React.SyntheticEvent ) {
		event.preventDefault();
		trackLoginType( 'guest' );
		actions.setGuest( true );
	}

	const handleClose = useCallback( () => {
		trackSummary( {
			choices,
			completedSteps: [ ...completedSteps ],
			isConnected,
			isGuest,
		} );
		window.dispatchEvent( new CustomEvent( 'e-onboarding-user-exit' ) );

		updateProgress.mutate(
			{ user_exit: true },
			{
				onSuccess: () => {
					actions.setExitType( 'user_exit' );
					onClose?.();
				},
				onError: ( error ) => {
					trackErrorReported( {
						targetType: 'request',
						targetName: 'user_exit',
						stepId,
						errorBody: error instanceof Error ? error.message : 'Failed to update progress',
					} );
					actions.setExitType( 'user_exit' );
					onClose?.();
				},
			}
		);
	}, [
		actions,
		choices,
		completedSteps,
		isConnected,
		isGuest,
		onClose,
		stepId,
		trackErrorReported,
		trackSummary,
		updateProgress,
	] );

	function handleBack() {
		trackBackClicked( stepId );

		if ( isFirst ) {
			actions.setGuest( false );
		} else {
			actions.prevStep();
		}
	}

	const redirectToNewPage = useCallback( () => {
		isCompletingRef.current = true;
		const redirectUrl = urls.createNewPage || urls.editor || urls.dashboard;
		const mp = getMixpanel().getMixpanelInstance?.() as
			| { request_batchers?: { events?: { flush: () => void } } }
			| undefined;
		mp?.request_batchers?.events?.flush?.();
		window.location.href = redirectUrl;
	}, [ urls ] );

	const handleSkip = useCallback( () => {
		trackSkipClicked( stepId );

		if ( isLast ) {
			trackSummary( {
				choices,
				completedSteps: [ ...completedSteps, stepId ],
				isConnected,
				isGuest,
			} );
			updateProgress.mutate(
				{
					skip_step: true,
					complete: true,
					step_index: stepIndex,
					total_steps: totalSteps,
				},
				{
					onSuccess: redirectToNewPage,
					onError: ( error ) => {
						trackErrorReported( {
							targetType: 'request',
							targetName: 'skip_and_complete',
							stepId,
							errorBody: error instanceof Error ? error.message : 'Failed to update progress',
						} );
						redirectToNewPage();
					},
				}
			);
			return;
		}

		updateProgress.mutate(
			{
				skip_step: true,
				step_index: stepIndex,
				total_steps: totalSteps,
			},
			{
				onSuccess: () => {
					actions.nextStep();
				},
				onError: ( error ) => {
					trackErrorReported( {
						targetType: 'request',
						targetName: 'skip_step',
						stepId,
						errorBody: error instanceof Error ? error.message : 'Failed to update progress',
					} );
					actions.nextStep();
				},
			}
		);
	}, [
		actions,
		choices,
		completedSteps,
		isConnected,
		isGuest,
		isLast,
		stepId,
		stepIndex,
		totalSteps,
		trackErrorReported,
		trackSkipClicked,
		trackSummary,
		updateProgress,
		redirectToNewPage,
	] );

	const saveChoicesFireAndForget = useCallback(
		( choiceData: Record< string, unknown > ) => {
			updateChoices.mutate( choiceData, {
				onError: ( error ) => {
					trackErrorReported( {
						targetType: 'save',
						targetName: Object.keys( choiceData )[ 0 ] ?? stepId,
						stepId,
						errorBody: error instanceof Error ? error.message : 'Failed to save choices',
					} );
				},
			} );
		},
		[ updateChoices, trackErrorReported, stepId ]
	);

	const handleContinue = useCallback(
		( directChoice?: Record< string, unknown > ) => {
			if ( stepId === StepId.SITE_FEATURES ) {
				trackProFeaturesSelected( {
					targetName: 'continue_with_free',
					features: ( choices.site_features as string[] ) || [],
				} );
			}

			const storedChoice = choices[ stepId as keyof typeof choices ];
			const choiceData = directChoice ?? ( isChoiceEmpty( storedChoice ) ? null : { [ stepId ]: storedChoice } );

			if ( choiceData ) {
				saveChoicesFireAndForget( choiceData );
			}

			if ( stepId === StepId.THEME_SELECTION ) {
				const themeSlug = ( choiceData?.theme_selection ?? choices.theme_selection ) as string;

				if ( themeSlug && isLast ) {
					installTheme.mutate( themeSlug, {
						onSuccess: () => {
							updateProgress.mutate(
								{
									complete_step: stepId,
									complete: true,
									step_index: stepIndex,
									total_steps: totalSteps,
								},
								{
									onSuccess: redirectToNewPage,
									onError: ( error ) => {
										trackErrorReported( {
											targetType: 'request',
											targetName: 'complete_step',
											stepId,
											errorBody:
												error instanceof Error ? error.message : 'Failed to update progress',
										} );
										redirectToNewPage();
									},
								}
							);
						},
						onError: ( error ) => {
							trackErrorReported( {
								targetType: 'install',
								targetName: 'continue_with_this_theme',
								stepId: 'theme_selection',
								errorBody: error instanceof Error ? error.message : 'Failed to install theme',
							} );
							showToast( t( 'error.theme_install_failed' ) );
							updateProgress.mutate(
								{
									complete_step: stepId,
									complete: true,
									step_index: stepIndex,
									total_steps: totalSteps,
								},
								{
									onSuccess: redirectToNewPage,
									onError: ( progressError ) => {
										trackErrorReported( {
											targetType: 'request',
											targetName: 'complete_step',
											stepId,
											errorBody:
												progressError instanceof Error
													? progressError.message
													: 'Failed to update progress',
										} );
										redirectToNewPage();
									},
								}
							);
						},
					} );
					return;
				}

				if ( themeSlug ) {
					installTheme.mutate( themeSlug, {
						onError: ( error ) => {
							trackErrorReported( {
								targetType: 'install',
								targetName: 'continue_with_this_theme',
								stepId: 'theme_selection',
								errorBody: error instanceof Error ? error.message : 'Failed to install theme',
							} );
							showToast( t( 'error.theme_install_failed' ) );
						},
					} );
				}
			}

			if ( isLast ) {
				trackSummary( {
					choices,
					completedSteps: [ ...completedSteps, stepId ],
					isConnected,
					isGuest,
				} );
				updateProgress.mutate(
					{
						complete_step: stepId,
						complete: true,
						step_index: stepIndex,
						total_steps: totalSteps,
					},
					{
						onSuccess: redirectToNewPage,
						onError: ( error ) => {
							trackErrorReported( {
								targetType: 'request',
								targetName: 'complete_step',
								stepId,
								errorBody: error instanceof Error ? error.message : 'Failed to update progress',
							} );
							redirectToNewPage();
						},
					}
				);
				return;
			}

			updateProgress.mutate(
				{
					complete_step: stepId,
					step_index: stepIndex,
					total_steps: totalSteps,
				},
				{
					onSuccess: () => {
						actions.completeStep( stepId );
						actions.nextStep();
					},
					onError: ( error ) => {
						trackErrorReported( {
							targetType: 'request',
							targetName: 'complete_step',
							stepId,
							errorBody: error instanceof Error ? error.message : 'Failed to update progress',
						} );
						actions.completeStep( stepId );
						actions.nextStep();
					},
				}
			);
		},
		[
			actions,
			choices,
			completedSteps,
			isConnected,
			isGuest,
			isLast,
			stepId,
			stepIndex,
			totalSteps,
			updateProgress,
			saveChoicesFireAndForget,
			installTheme,
			showToast,
			redirectToNewPage,
			trackErrorReported,
			trackProFeaturesSelected,
			trackSummary,
		]
	);

	const rightPanelConfig = useMemo( () => getStepVisualConfig( stepId ), [ stepId ] );
	const isPending = updateProgress.isPending || isLoading;

	const choiceForStep = choices[ stepId as keyof typeof choices ];
	const continueDisabled = isContinueDisabled( stepId, isLast, choiceForStep );
	const isBackDisabled = isFirst && isConnected;

	const getContinueLabel = () => {
		if ( stepId === StepId.THEME_SELECTION && ! completedSteps.includes( StepId.THEME_SELECTION ) ) {
			return t( 'steps.theme_selection.continue_with_theme' );
		}

		if ( stepId === StepId.SITE_FEATURES && ! completedSteps.includes( StepId.SITE_FEATURES ) ) {
			return t( 'steps.site_features.continue_with_free' );
		}

		if ( isLast ) {
			return t( 'common.finish' );
		}

		return t( 'common.continue' );
	};

	const renderStepContent = () => {
		switch ( stepId ) {
			case StepId.BUILDING_FOR:
				return <BuildingFor onComplete={ handleContinue } />;
			case StepId.SITE_ABOUT:
				return <SiteAbout />;
			case StepId.EXPERIENCE_LEVEL:
				return <ExperienceLevel onComplete={ handleContinue } />;
			case StepId.THEME_SELECTION:
				return <ThemeSelection onComplete={ handleContinue } />;
			case StepId.SITE_FEATURES:
				return <SiteFeatures />;
			default:
				return <Box sx={ { flex: 1, width: '100%' } } />;
		}
	};

	if ( ! hasPassedLogin ) {
		return (
			<BaseLayout
				topBar={
					<TopBar>
						<TopBarContent showUpgrade={ false } showClose={ false } />
					</TopBar>
				}
			>
				<Login onConnect={ handleConnect } onContinueAsGuest={ handleContinueAsGuest } />
			</BaseLayout>
		);
	}

	if ( shouldShowProInstall ) {
		return (
			<BaseLayout
				topBar={
					<TopBar>
						<TopBarContent showUpgrade={ false } showClose={ false } />
					</TopBar>
				}
			>
				<ProInstall />
			</BaseLayout>
		);
	}

	return (
		<BaseLayout
			testId="onboarding-steps"
			topBar={
				<TopBar>
					<TopBarContent
						showClose={ false }
						onClose={ handleClose }
						onUpgrade={ () => {
							trackUpgradeClicked( stepId );
							window.open( urls.upgradeUrl, '_blank' );
						} }
					/>
				</TopBar>
			}
			footer={
				<Footer>
					<FooterActions
						showBack
						showSkip
						showContinue
						isBackDisabled={ isBackDisabled }
						continueLabel={ getContinueLabel() }
						continueDisabled={ continueDisabled }
						continueLoading={ isPending }
						onBack={ handleBack }
						onSkip={ handleSkip }
						onContinue={ () => handleContinue() }
					/>
				</Footer>
			}
		>
			<SplitLayout
				left={ renderStepContent() }
				rightConfig={ rightPanelConfig }
				progress={ { currentStep: stepIndex, totalSteps } }
			/>
		</BaseLayout>
	);
}
