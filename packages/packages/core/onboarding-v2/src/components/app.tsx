/**
 * Onboarding V2 App Component
 *
 * Main application wrapper that provides the shell for the onboarding wizard.
 * Handles the overall layout, background, and routing between steps.
 */

import * as React from 'react';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, styled } from '@elementor/ui';

import { completeStepOnServer, markUserExitOnServer } from '../api/client';
import { BlankPage } from '../pages/blank-page';
import {
	clearUnexpectedExit,
	completeStep,
	onboardingV2Slice,
	selectCurrentStep,
	selectHadUnexpectedExit,
} from '../store/slice';
import { Footer } from './footer';
import { Header } from './header';

/**
 * Total number of onboarding steps.
 */
const TOTAL_STEPS = 14;

const AppContainer = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	bottom: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	background: `linear-gradient(135deg, ${ theme.palette.background.default } 0%, ${ theme.palette.grey[ 100 ] } 100%)`,
	overflow: 'hidden',
} ) );

const ContentWrapper = styled( Box )( ( { theme } ) => ( {
	position: 'relative',
	width: '100%',
	maxWidth: 800,
	minHeight: 500,
	background: theme.palette.background.paper,
	borderRadius: theme.shape.borderRadius * 2,
	boxShadow: theme.shadows[ 8 ],
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
} ) );

const MainContent = styled( Box )( ( { theme } ) => ( {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	padding: theme.spacing( 8, 4, 10, 4 ),
	marginTop: 56, // Header height
	overflow: 'auto',
} ) );

const ProgressIndicator = styled( Box )( ( { theme } ) => ( {
	position: 'absolute',
	top: 72,
	left: '50%',
	transform: 'translateX(-50%)',
	color: theme.palette.text.secondary,
	fontSize: 14,
	fontWeight: 500,
} ) );

interface AppProps {
	/**
	 * Optional custom page components to render at each step.
	 * If not provided, uses the default BlankPage component.
	 */
	pages?: React.ComponentType< PageProps >[];

	/**
	 * Callback when onboarding is completed.
	 */
	onComplete?: () => void;

	/**
	 * Callback when onboarding is closed/skipped.
	 */
	onClose?: () => void;
}

export interface PageProps {
	/**
	 * Current step index (0-based).
	 */
	stepIndex: number;

	/**
	 * Total number of steps.
	 */
	totalSteps: number;

	/**
	 * Callback to go to the next step.
	 */
	onNext: () => void;

	/**
	 * Callback to go to the previous step.
	 */
	onPrev: () => void;

	/**
	 * Callback to skip to a specific step.
	 */
	onSkipTo: ( step: number ) => void;
}

/**
 * Main App component for the onboarding wizard.
 * @param root0
 * @param root0.pages
 * @param root0.onComplete
 * @param root0.onClose
 */
export function App( { pages = [], onComplete, onClose }: AppProps ) {
	const dispatch = useDispatch();
	const currentStep = useSelector( selectCurrentStep );
	const hadUnexpectedExit = useSelector( selectHadUnexpectedExit );

	// Handle resuming from unexpected exit
	React.useEffect( () => {
		if ( hadUnexpectedExit ) {
			// Could show a dialog asking if user wants to resume
			// For now, just clear the flag
			dispatch( clearUnexpectedExit() );
		}
	}, [ hadUnexpectedExit, dispatch ] );

	const handleClose = React.useCallback( async () => {
		try {
			await markUserExitOnServer();
			dispatch( onboardingV2Slice.actions.setExitType( 'user_exit' ) );

			if ( onClose ) {
				onClose();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to mark user exit:', error );
		}
	}, [ dispatch, onClose ] );

	const handleBack = React.useCallback( () => {
		if ( currentStep > 0 ) {
			dispatch( onboardingV2Slice.actions.setCurrentStep( currentStep - 1 ) );
		}
	}, [ currentStep, dispatch ] );

	const handleSkip = React.useCallback( () => {
		if ( currentStep < TOTAL_STEPS - 1 ) {
			dispatch( onboardingV2Slice.actions.setCurrentStep( currentStep + 1 ) );
		}
	}, [ currentStep, dispatch ] );

	const handleContinue = React.useCallback( async () => {
		try {
			await completeStepOnServer( currentStep, TOTAL_STEPS );
			dispatch( completeStep( currentStep ) );

			if ( currentStep < TOTAL_STEPS - 1 ) {
				dispatch( onboardingV2Slice.actions.setCurrentStep( currentStep + 1 ) );
			} else if ( onComplete ) {
				onComplete();
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to complete step:', error );
		}
	}, [ currentStep, dispatch, onComplete ] );

	const handleSkipTo = React.useCallback(
		( step: number ) => {
			if ( step >= 0 && step < TOTAL_STEPS ) {
				dispatch( onboardingV2Slice.actions.setCurrentStep( step ) );
			}
		},
		[ dispatch ]
	);

	// Get the current page component
	const PageComponent = pages[ currentStep ] || BlankPage;

	return (
		<AppContainer>
			<ContentWrapper>
				<Header onClose={ handleClose } />

				<ProgressIndicator>
					{ `${ Math.floor( currentStep / 2 ) + 1 }/${ Math.ceil( TOTAL_STEPS / 2 ) }` }
				</ProgressIndicator>

				<MainContent>
					<PageComponent
						stepIndex={ currentStep }
						totalSteps={ TOTAL_STEPS }
						onNext={ handleContinue }
						onPrev={ handleBack }
						onSkipTo={ handleSkipTo }
					/>
				</MainContent>

				<Footer
					showBack={ currentStep > 0 }
					showSkip={ currentStep < TOTAL_STEPS - 1 }
					showContinue
					continueLabel={ currentStep === TOTAL_STEPS - 1 ? 'Finish' : 'Continue' }
					onBack={ handleBack }
					onSkip={ handleSkip }
					onContinue={ handleContinue }
				/>
			</ContentWrapper>
		</AppContainer>
	);
}

export default App;
