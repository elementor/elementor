import * as React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { createQueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore, __getStore, __StoreProvider as StoreProvider } from '@elementor/store';
import { Box, DirectionProvider, styled, ThemeProvider } from '@elementor/ui';

import { useOnboarding } from '../hooks/use-onboarding';
import { useUpdateProgress } from '../hooks/use-update-progress';
import { registerOnboardingSlice } from '../store';
import { Connect } from './connect';
import { Layout } from './layout';

const ContentArea = styled( Box )( ( { theme } ) => ( {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	padding: theme.spacing( 4 ),
	margin: '0 auto',
	width: '100%',
} ) );

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
		actions.prevStep();
	}, [ actions ] );

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

	if ( ! isConnected ) {
		return (
			<Layout showHeader showFooter={ false } headerProps={ { showCloseButton: false } }>
				<Connect
					onConnect={ handleConnect }
					onContinueAsGuest={ handleContinueAsGuest }
					connectUrl={ urls.connect }
				/>
			</Layout>
		);
	}

	const isPending = updateProgress.isPending || isLoading;

	const footerProps = {
		showBack: ! isFirst,
		showSkip: ! isLast,
		showContinue: true,
		continueLabel: isLast ? 'Finish' : 'Continue',
		continueLoading: isPending,
		onBack: handleBack,
		onSkip: handleSkip,
		onContinue: handleContinue,
	};

	return (
		<Layout
			showHeader
			showFooter
			onClose={ handleClose }
			headerProps={ { showCloseButton: false } }
			footerProps={ footerProps }
		>
			<ContentArea>{ /* Step content will be rendered here */ }</ContentArea>
		</Layout>
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
