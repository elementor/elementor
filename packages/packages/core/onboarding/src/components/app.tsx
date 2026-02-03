import * as React from 'react';
import { __useDispatch as useDispatch, __useSelector as useSelector } from '@elementor/store';
import { Box, styled } from '@elementor/ui';

import { completeStepOnServer, markUserExitOnServer } from '../api/client';
import { BlankPage } from '../pages/blank-page';
import {
	clearUnexpectedExit,
	completeStep,
	onboardingSlice,
	selectCurrentStep,
	selectHadUnexpectedExit,
} from '../store/slice';
import { Footer } from './footer';
import { Header } from './header';

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
	marginTop: 56,
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
	pages?: React.ComponentType< PageProps >[];
	onComplete?: () => void;
	onClose?: () => void;
}

export interface PageProps {
	stepIndex: number;
	totalSteps: number;
	onNext: () => void;
	onPrev: () => void;
	onSkipTo: ( step: number ) => void;
}

export function App( { pages = [], onComplete, onClose }: AppProps ) {
	const dispatch = useDispatch();
	const currentStep = useSelector( selectCurrentStep );
	const hadUnexpectedExit = useSelector( selectHadUnexpectedExit );

	React.useEffect( () => {
		if ( hadUnexpectedExit ) {
			dispatch( clearUnexpectedExit() );
		}
	}, [ hadUnexpectedExit, dispatch ] );

	const handleClose = React.useCallback( async () => {
		try {
			await markUserExitOnServer();
			dispatch( onboardingSlice.actions.setExitType( 'user_exit' ) );

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
			dispatch( onboardingSlice.actions.setCurrentStep( currentStep - 1 ) );
		}
	}, [ currentStep, dispatch ] );

	const handleSkip = React.useCallback( () => {
		if ( currentStep < TOTAL_STEPS - 1 ) {
			dispatch( onboardingSlice.actions.setCurrentStep( currentStep + 1 ) );
		}
	}, [ currentStep, dispatch ] );

	const handleContinue = React.useCallback( async () => {
		try {
			await completeStepOnServer( currentStep, TOTAL_STEPS );
			dispatch( completeStep( currentStep ) );

			if ( currentStep < TOTAL_STEPS - 1 ) {
				dispatch( onboardingSlice.actions.setCurrentStep( currentStep + 1 ) );
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
				dispatch( onboardingSlice.actions.setCurrentStep( step ) );
			}
		},
		[ dispatch ]
	);

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
