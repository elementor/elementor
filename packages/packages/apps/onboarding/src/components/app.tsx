import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __getStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { Box, DirectionProvider, ThemeProvider } from '@elementor/ui';

import { useOnboarding } from '../hooks/use-onboarding';
import { useUpdateProgress } from '../hooks/use-update-progress';
import { Login } from '../steps/screens/login';
import { getStepVisualConfig } from '../steps/step-visuals';
import { registerOnboardingSlice } from '../store';
import { BaseLayout } from './ui/base-layout';
import { Footer } from './ui/footer';
import { FooterActions } from './ui/footer-actions';
import { SplitLayout } from './ui/split-layout';
import { TopBar } from './ui/top-bar';
import { TopBarContent } from './ui/top-bar-content';

interface AppProps {
	onComplete?: () => void;
	onClose?: () => void;
}

function AppContent( { onComplete, onClose }: AppProps ) {
	const { stepId, stepIndex, isFirst, isLast, totalSteps, hadUnexpectedExit, isLoading, isConnected, urls, actions } =
		useOnboarding();

	const updateProgress = useUpdateProgress();

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
		actions.setConnected( true );
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
					actions.setError( 'Failed to mark user exit.' );
				},
			}
		);
	}, [ actions, onClose, updateProgress ] );

	const handleBack = useCallback( () => {
		if ( isFirst ) {
			actions.setConnected( false );
		} else {
			actions.prevStep();
		}
	}, [ actions, isFirst ] );

	const handleSkip = useCallback( () => {
		actions.nextStep();
	}, [ actions ] );

	const handleContinue = useCallback( () => {
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
					actions.setError( 'Failed to complete step.' );
				},
			}
		);
	}, [ stepId, stepIndex, totalSteps, actions, isLast, onComplete, updateProgress ] );

	const rightPanelConfig = useMemo( () => getStepVisualConfig( stepId ), [ stepId ] );
	const isPending = updateProgress.isPending || isLoading;

	// Login screen - no footer, minimal header
	if ( ! isConnected ) {
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

	// Onboarding steps
	return (
		<BaseLayout
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
						continueLabel={ isLast ? 'Finish' : 'Continue' }
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

export function App( props: AppProps ) {
	const store = useMemo( () => {
		registerOnboardingSlice();

		let existingStore = __getStore();

		if ( ! existingStore ) {
			existingStore = __createStore();
		}

		return existingStore;
	}, [] );

	const queryClient = useMemo( () => createQueryClient(), [] );

	return (
		<StoreProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<DirectionProvider rtl={ window.document.dir === 'rtl' }>
					<ThemeProvider palette="argon-beta">
						<AppContent { ...props } />
					</ThemeProvider>
				</DirectionProvider>
			</QueryClientProvider>
		</StoreProvider>
	);
}
