export { App, BaseLayout, TopBar, Footer } from './components';
export { useOnboarding, useUpdateProgress } from './hooks';
export {
	registerOnboardingSlice,
	slice,
	goToStep,
	goToStepIndex,
	nextStep,
	prevStep,
	completeStep,
	setUserChoice,
	setUserChoices,
	setExitType,
	startOnboarding,
	completeOnboarding,
	setLoading,
	setError,
	clearUnexpectedExit,
	setConnected,
	selectOnboarding,
	selectSteps,
	selectCurrentStepId,
	selectCurrentStepIndex,
	selectCompletedSteps,
	selectChoices,
	selectIsLoading,
	selectError,
	selectHadUnexpectedExit,
	selectIsConnected,
	selectUrls,
	selectCurrentStep,
	selectIsFirstStep,
	selectIsLastStep,
	selectTotalSteps,
	selectIsStepCompleted,
} from './store';
export { StepId } from './types';
export type {
	AssetAnimation,
	StepIdType,
	Step,
	OnboardingProgress,
	OnboardingChoices,
	OnboardingConfig,
	OnboardingState,
	RightPanelAsset,
	StepVisualConfig,
} from './types';

declare global {
	interface Window {
		elementorAppConfig?: {
			'e-onboarding'?: {
				version: string;
				restUrl: string;
				nonce: string;
				progress: {
					current_step_id?: string;
					current_step_index?: number;
					completed_steps?: string[];
					exit_type?: string | null;
					last_active_timestamp?: number | null;
					started_at?: number | null;
					completed_at?: number | null;
				};
				choices: Record< string, unknown >;
				hadUnexpectedExit: boolean;
				isConnected: boolean;
				steps: Array< { id: string; label: string } >;
				urls: {
					dashboard: string;
					editor: string;
					connect: string;
				};
			};
		};
	}
}
