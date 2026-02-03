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
	selectHadUnexpectedExit,
	selectIsCompleted,
	selectUserChoices,
	type State,
} from './store/slice';

export {
	fetchUserChoices,
	fetchUserProgress,
	updateUserChoices,
	updateUserProgress,
} from './api/client';

export type {
	ExitType,
	OnboardingState,
	UserChoices,
	UserProgress,
} from './types';
