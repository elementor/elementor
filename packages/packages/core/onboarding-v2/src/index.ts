/**
 * Onboarding V2 Package
 *
 * New onboarding experience for Elementor 2026.
 */

// Main initialization
export { init } from './init';

// Components
export { Header } from './components/header';
export { Footer } from './components/footer';
export { App } from './components/app';

// Pages
export { BlankPage } from './pages/blank-page';

// Store
export {
	onboardingV2Slice,
	selectCurrentStep,
	selectCompletedSteps,
	selectUserChoices,
	selectHadUnexpectedExit,
	selectIsCompleted,
	setCurrentStep,
	completeStep,
	setUserChoice,
	setExitType,
	resetOnboarding,
} from './store/slice';

// API
export {
	fetchUserProgress,
	updateUserProgress,
	fetchUserChoices,
	updateUserChoices,
} from './api/client';

// Types
export type {
	OnboardingV2State,
	UserProgress,
	UserChoices,
	ExitType,
} from './types';
