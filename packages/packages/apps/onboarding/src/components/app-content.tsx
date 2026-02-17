import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCheckProStatus } from '../hooks/use-check-pro-status';
import { useElementorConnect } from '../hooks/use-elementor-connect';
import { useInstallPro } from '../hooks/use-install-pro';
import { useOnboarding } from '../hooks/use-onboarding';
import { useUpdateChoices } from '../hooks/use-update-choices';
import { useUpdateProgress } from '../hooks/use-update-progress';
import { BuildingFor } from '../steps/screens/building-for';
import { ExperienceLevel } from '../steps/screens/experience-level';
import { Login } from '../steps/screens/login';
import { ProInstall } from '../steps/screens/pro-install';
import { SiteAbout } from '../steps/screens/site-about';
import { ThemeSelection } from '../steps/screens/theme-selection';
import { getStepVisualConfig } from '../steps/step-visuals';
import { StepId } from '../types';
import { BaseLayout } from './ui/base-layout';
import { Footer } from './ui/footer';
import { FooterActions } from './ui/footer-actions';
import { SplitLayout } from './ui/split-layout';
import { TopBar } from './ui/top-bar';
import { TopBarContent } from './ui/top-bar-content';

const isChoiceEmpty = ( choice: unknown ): boolean => {
	return choice === null || choice === undefined || ( Array.isArray( choice ) && choice.length === 0 );
};

interface AppContentProps {
	onComplete?: () => void;
	onClose?: () => void;
}

export function AppContent( { onComplete, onClose }: AppContentProps ) {
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

	const updateProgress = useUpdateProgress();
	const updateChoices = useUpdateChoices();

	useEffect( () => {
		if ( hadUnexpectedExit ) {
			actions.clearUnexpectedExit();
		}
	}, [ hadUnexpectedExit, actions ] );

	const checkProStatus = useCheckProStatus();

	const handleConnectSuccess = useCallback( async () => {
		const proStatus = await checkProStatus();
		actions.setHasProSubscription( proStatus.hasProSubscription );
		actions.setConnected( true );
	}, [ actions, checkProStatus ] );

	const handleConnect = useElementorConnect( {
		connectUrl: urls.connect,
		onSuccess: handleConnectSuccess,
	} );

	const handleContinueAsGuest = useCallback( () => {
		actions.setGuest( true );
	}, [ actions ] );

	const installPro = useInstallPro();

	const handleProInstall = useCallback( () => {
		installPro.mutate( undefined, {
			onSuccess: () => {
				actions.skipProInstall();
			},
		} );
	}, [ installPro, actions ] );

	const handleSkipProInstall = useCallback( () => {
		actions.skipProInstall();
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
					actions.setError( __( 'Failed to mark user exit.', 'elementor' ) );
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

	const handleSkip = useCallback( () => {
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
	}, [ actions, stepIndex, totalSteps, updateProgress ] );

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

			updateProgress.mutate(
				{
					complete_step: stepId,
					step_index: stepIndex,
					total_steps: totalSteps,
				},
				{
					onSuccess: () => {
						actions.completeStep( stepId );

						if ( ! isLast ) {
							actions.nextStep();
						} else {
							onComplete?.();
						}
					},
					onError: () => {
						actions.setError( __( 'Failed to complete step.', 'elementor' ) );
					},
				}
			);
		},
		[ stepId, stepIndex, totalSteps, choices, actions, isLast, onComplete, updateProgress, updateChoices ]
	);

	const rightPanelConfig = useMemo( () => getStepVisualConfig( stepId ), [ stepId ] );
	const isPending = updateProgress.isPending || isLoading;

	const choiceForStep = choices[ stepId as keyof typeof choices ];
	const continueDisabled = isChoiceEmpty( choiceForStep );

	const getContinueLabel = () => {
		if ( isLast ) {
			return __( 'Finish', 'elementor' );
		}

		if ( stepId === StepId.THEME_SELECTION && ! completedSteps.includes( StepId.THEME_SELECTION ) ) {
			return __( 'Continue with this theme', 'elementor' );
		}

		return __( 'Continue', 'elementor' );
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
				<Login
					onConnect={ handleConnect }
					onContinueAsGuest={ handleContinueAsGuest }
				/>
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
				<ProInstall
					onInstall={ handleProInstall }
					onSkip={ handleSkipProInstall }
					isInstalling={ installPro.isPending }
					error={ installPro.error?.message ?? null }
				/>
			</BaseLayout>
		);
	}

	return (
		<BaseLayout
			testId="onboarding-steps"
			topBar={
				<TopBar>
					<TopBarContent showClose={ false } onClose={ handleClose } />
				</TopBar>
			}
			footer={
				<Footer>
					<FooterActions
						showBack
						showSkip={ ! isLast }
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
