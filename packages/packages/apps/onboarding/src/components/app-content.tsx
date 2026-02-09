import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { Box } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useOnboarding } from '../hooks/use-onboarding';
import { useUpdateChoices } from '../hooks/use-update-choices';
import { useUpdateProgress } from '../hooks/use-update-progress';
import { Login } from '../steps/screens/login';
import { getStepVisualConfig } from '../steps/step-visuals';
import { BaseLayout } from './ui/base-layout';
import { Footer } from './ui/footer';
import { FooterActions } from './ui/footer-actions';
import { SplitLayout } from './ui/split-layout';
import { TopBar } from './ui/top-bar';
import { TopBarContent } from './ui/top-bar-content';

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
		choices,
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

	const handleConnect = useCallback( () => {
		if ( urls.connect ) {
			window.location.href = urls.connect;
		}
	}, [ urls.connect ] );

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

	const handleContinue = useCallback( () => {
		const choiceForStep = choices[ stepId as keyof typeof choices ];
		const hasChoice =
			choiceForStep !== null &&
			choiceForStep !== undefined &&
			( ! Array.isArray( choiceForStep ) || choiceForStep.length > 0 );

		if ( hasChoice ) {
			updateChoices.mutate( { [ stepId ]: choiceForStep } );
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
	}, [ stepId, stepIndex, totalSteps, choices, actions, isLast, onComplete, updateProgress, updateChoices ] );

	const rightPanelConfig = useMemo( () => getStepVisualConfig( stepId ), [ stepId ] );
	const isPending = updateProgress.isPending || isLoading;

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
					connectUrl={ urls.connect }
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
						continueLabel={ isLast ? __( 'Finish', 'elementor' ) : __( 'Continue', 'elementor' ) }
						continueLoading={ isPending }
						onBack={ handleBack }
						onSkip={ handleSkip }
						onContinue={ handleContinue }
					/>
				</Footer>
			}
		>
			<SplitLayout
				left={ <Box sx={ { flex: 1, width: '100%' } } /> }
				rightConfig={ rightPanelConfig }
				progress={ { currentStep: stepIndex, totalSteps } }
			/>
		</BaseLayout>
	);
}
