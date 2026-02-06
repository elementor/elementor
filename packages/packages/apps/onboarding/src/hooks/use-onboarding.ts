import { __useDispatch, __useSelector } from '@elementor/store';

import {
	clearUnexpectedExit,
	completeOnboarding,
	completeStep,
	goToStep,
	goToStepIndex,
	nextStep,
	prevStep,
	selectChoices,
	selectCompletedSteps,
	selectCurrentStep,
	selectCurrentStepId,
	selectCurrentStepIndex,
	selectError,
	selectHadUnexpectedExit,
	selectIsConnected,
	selectIsFirstStep,
	selectIsLastStep,
	selectIsLoading,
	selectSteps,
	selectTotalSteps,
	selectUrls,
	setConnected,
	setError,
	setExitType,
	setLoading,
	setUserChoice,
	setUserChoices,
	startOnboarding,
} from '../store';
import type { OnboardingChoices, StepIdType } from '../types';

export function useOnboarding() {
	const dispatch = __useDispatch();

	const stepId = __useSelector( selectCurrentStepId );
	const stepIndex = __useSelector( selectCurrentStepIndex );
	const step = __useSelector( selectCurrentStep );
	const steps = __useSelector( selectSteps );
	const isFirst = __useSelector( selectIsFirstStep );
	const isLast = __useSelector( selectIsLastStep );
	const totalSteps = __useSelector( selectTotalSteps );
	const completedSteps = __useSelector( selectCompletedSteps );
	const choices = __useSelector( selectChoices );
	const isLoading = __useSelector( selectIsLoading );
	const error = __useSelector( selectError );
	const hadUnexpectedExit = __useSelector( selectHadUnexpectedExit );
	const isConnected = __useSelector( selectIsConnected );
	const urls = __useSelector( selectUrls );

	const actions = {
		goToStep: ( id: StepIdType ) => dispatch( goToStep( id ) ),
		goToStepIndex: ( index: number ) => dispatch( goToStepIndex( index ) ),
		nextStep: () => dispatch( nextStep() ),
		prevStep: () => dispatch( prevStep() ),
		completeStep: ( id: StepIdType ) => dispatch( completeStep( id ) ),
		setUserChoice: ( key: keyof OnboardingChoices, value: unknown ) => dispatch( setUserChoice( { key, value } ) ),
		setUserChoices: ( data: Partial< OnboardingChoices > ) => dispatch( setUserChoices( data ) ),
		setExitType: ( type: string | null ) => dispatch( setExitType( type ) ),
		startOnboarding: () => dispatch( startOnboarding() ),
		completeOnboarding: () => dispatch( completeOnboarding() ),
		setLoading: ( loading: boolean ) => dispatch( setLoading( loading ) ),
		setError: ( err: string | null ) => dispatch( setError( err ) ),
		clearUnexpectedExit: () => dispatch( clearUnexpectedExit() ),
		setConnected: ( connected: boolean ) => dispatch( setConnected( connected ) ),
	};

	return {
		stepId,
		stepIndex,
		step,
		steps,
		isFirst,
		isLast,
		totalSteps,
		completedSteps,
		choices,
		isLoading,
		error,
		hadUnexpectedExit,
		isConnected,
		urls,
		actions,
	};
}
