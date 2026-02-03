export { init } from './init';

export { App } from './components/app';
export { Footer } from './components/footer';
export { Header } from './components/header';

export { BlankPage } from './pages/blank-page';

export {
	completeStep,
	onboardingSlice,
	selectCompletedSteps,
	selectCurrentStep,
	selectError,
	selectExitType,
	selectHadUnexpectedExit,
	selectIsCompleted,
	selectIsLoading,
	selectProgress,
	selectUserChoices,
	type State,
} from './store/slice';

export {
	useUpdateUserChoices,
	useUpdateUserProgress,
	useUserChoices,
	useUserProgress,
	USER_CHOICES_QUERY_KEY,
	USER_PROGRESS_QUERY_KEY,
} from './hooks';

export { choicesApi, type UpdateChoicesPayload } from './api/choices';
export { progressApi, type UpdateProgressPayload } from './api/progress';

export type {
	ExitType,
	OnboardingState,
	UserChoices,
	UserProgress,
} from './types';
