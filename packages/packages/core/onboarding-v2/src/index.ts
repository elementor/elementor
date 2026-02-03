/**
 * Onboarding V2 Package
 *
 * New onboarding experience for Elementor 2026.
 */

// Main initialization
export { init } from './init';

// Components
export { App } from './components/app';
export { Footer } from './components/footer';
export { Header } from './components/header';

// Pages
export { BlankPage } from './pages/blank-page';

// Store
export {
	completeStep,
	onboardingV2Slice,
	selectCompletedSteps,
	selectCurrentStep,
	selectHadUnexpectedExit,
	selectIsCompleted,
	selectUserChoices,
	type State,
} from './store/slice';

// API
export {
	fetchUserChoices,
	fetchUserProgress,
	updateUserChoices,
	updateUserProgress,
} from './api/client';

// Types
export type {
	ExitType,
	OnboardingV2State,
	UserChoices,
	UserProgress,
} from './types';
