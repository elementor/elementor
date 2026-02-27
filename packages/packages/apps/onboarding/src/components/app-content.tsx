import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@elementor/ui';

import { useCheckProInstallScreen } from '../hooks/use-check-pro-install-screen';
import { useElementorConnect } from '../hooks/use-elementor-connect';
import { useLottiePreload } from '../hooks/use-lottie-preload';
import { useOnboarding } from '../hooks/use-onboarding';
import { useUpdateChoices } from '../hooks/use-update-choices';
import { useUpdateProgress } from '../hooks/use-update-progress';
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
import { BaseLayout } from './ui/base-layout';
import { CompletionScreen } from './ui/completion-screen';
import { Footer } from './ui/footer';
import { FooterActions } from './ui/footer-actions';
import { SplitLayout } from './ui/split-layout';
import { TopBar } from './ui/top-bar';
import { TopBarContent } from './ui/top-bar-content';

const isChoiceEmpty = ( choice: unknown ): boolean => {
	return choice === null || choice === undefined || ( Array.isArray( choice ) && choice.length === 0 );
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
		hadUnexpectedExit,
		isLoading,
		hasPassedLogin,
		shouldShowProInstall,
		choices,
		completedSteps,
		urls,
		actions,
	} = useOnboarding();

	const [ isCompleting, setIsCompleting ] = useState( false );

	useLottiePreload();

	const updateProgress = useUpdateProgress();
	const updateChoices = useUpdateChoices();

	useEffect( () => {
		if ( hadUnexpectedExit ) {
			actions.clearUnexpectedExit();
		}
	}, [ hadUnexpectedExit, actions ] );

	const checkProInstallScreen = useCheckProInstallScreen();

	const handleConnectSuccess = useCallback( async () => {
		const result = await checkProInstallScreen();
		actions.setShouldShowProInstallScreen( result.shouldShowProInstallScreen );
		actions.setConnected( true );
	}, [ actions, checkProInstallScreen ] );

	const handleConnect = useElementorConnect( {
		connectUrl: urls.connect,
		onSuccess: handleConnectSuccess,
	} );

	const handleContinueAsGuest = useCallback( () => {
		actions.setGuest( true );
	}, [ actions ] );

	const handleClose = useCallback( () => {
		window.dispatchEvent( new CustomEvent( 'e-onboarding-user-exit' ) );

		updateProgress.mutate(
			{ user_exit: true },
			{
				onSuccess: () => {
					actions.setExitType( 'user_exit' );
					onClose?.();
				},
				onError: () => {
					actions.setError( t( 'error.failed_mark_exit' ) );
				},
			}
		);
	}, [ actions, onClose, updateProgress ] );

	const handleBack = useCallback( () => {
		if ( isFirst ) {
			actions.setGuest( false );
		} else {
			actions.prevStep();
		}
	}, [ actions, isFirst ] );

	const redirectToNewPage = useCallback( () => {
		const redirectUrl = urls.createNewPage || urls.editor || urls.dashboard;
		window.location.href = redirectUrl;
	}, [ urls ] );

	const handleSkip = useCallback( () => {
		if ( isLast ) {
			setIsCompleting( true );
			updateProgress.mutate(
				{
					skip_step: true,
					complete: true,
					step_index: stepIndex,
					total_steps: totalSteps,
				},
				{
					onSuccess: redirectToNewPage,
					onError: redirectToNewPage,
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
				onError: () => {
					actions.nextStep();
				},
			}
		);
	}, [ actions, isLast, stepIndex, totalSteps, updateProgress, redirectToNewPage ] );

	const handleContinue = useCallback(
		( directChoice?: Record< string, unknown > ) => {
			if ( directChoice ) {
				updateChoices.mutate( directChoice );
			} else {
				const storedChoice = choices[ stepId as keyof typeof choices ];

				if ( ! isChoiceEmpty( storedChoice ) ) {
					updateChoices.mutate( { [ stepId ]: storedChoice } );
				}
			}

			if ( isLast ) {
				setIsCompleting( true );
				updateProgress.mutate(
					{
						complete_step: stepId,
						complete: true,
						step_index: stepIndex,
						total_steps: totalSteps,
					},
					{
						onSuccess: redirectToNewPage,
						onError: redirectToNewPage,
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
					onError: () => {
						actions.setError( t( 'error.failed_complete_step' ) );
					},
				}
			);
		},
		[ stepId, stepIndex, totalSteps, choices, actions, isLast, updateProgress, updateChoices, redirectToNewPage ]
	);

	const rightPanelConfig = useMemo( () => getStepVisualConfig( stepId ), [ stepId ] );
	const isPending = updateProgress.isPending || isLoading;

	const choiceForStep = choices[ stepId as keyof typeof choices ];
	const continueDisabled = ! isLast && isChoiceEmpty( choiceForStep );

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

	if ( isCompleting ) {
		return <CompletionScreen />;
	}

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
						onUpgrade={ () => window.open( urls.upgradeUrl, '_blank' ) }
					/>
				</TopBar>
			}
			footer={
				<Footer>
					<FooterActions
						showBack
						showSkip
						showContinue
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
