/**
 * Onboarding V2 Redux Slice
 *
 * Manages state for the onboarding flow including:
 * - Current step tracking
 * - Completed steps
 * - User choices
 * - Exit type (user-initiated vs unexpected)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { OnboardingV2State, UserProgress, UserChoices, ExitType } from '../types';

/**
 * Get initial state from window config or defaults.
 */
function getInitialState(): OnboardingV2State {
	const config = window.elementorOnboardingV2Config;

	if ( config ) {
		return {
			progress: {
				currentStep: config.progress?.currentStep ?? 0,
				completedSteps: config.progress?.completedSteps ?? [],
				exitType: config.progress?.exitType ?? null,
				lastActiveTimestamp: config.progress?.lastActiveTimestamp ?? null,
				startedAt: config.progress?.startedAt ?? null,
				completedAt: config.progress?.completedAt ?? null,
			},
			choices: config.choices ?? {},
			isLoading: false,
			error: null,
			hadUnexpectedExit: config.hadUnexpectedExit ?? false,
		};
	}

	return {
		progress: {
			currentStep: 0,
			completedSteps: [],
			exitType: null,
			lastActiveTimestamp: null,
			startedAt: null,
			completedAt: null,
		},
		choices: {},
		isLoading: false,
		error: null,
		hadUnexpectedExit: false,
	};
}

export const onboardingV2Slice = createSlice( {
	name: 'onboardingV2',
	initialState: getInitialState(),
	reducers: {
		/**
		 * Set the current step.
		 */
		setCurrentStep: ( state, action: PayloadAction<number> ) => {
			state.progress.currentStep = action.payload;
		},

		/**
		 * Mark a step as completed.
		 */
		completeStep: ( state, action: PayloadAction<number> ) => {
			const stepIndex = action.payload;

			if ( ! state.progress.completedSteps.includes( stepIndex ) ) {
				state.progress.completedSteps.push( stepIndex );
			}

			// Find the next uncompleted step
			const totalSteps = 14; // Total onboarding steps
			for ( let i = 0; i < totalSteps; i++ ) {
				if ( ! state.progress.completedSteps.includes( i ) ) {
					state.progress.currentStep = i;
					break;
				}
			}
		},

		/**
		 * Set a user choice value.
		 */
		setUserChoice: ( state, action: PayloadAction<{ key: keyof UserChoices; value: UserChoices[keyof UserChoices] }> ) => {
			const { key, value } = action.payload;
			( state.choices as Record<string, unknown> )[ key ] = value;
		},

		/**
		 * Set multiple user choices at once.
		 */
		setUserChoices: ( state, action: PayloadAction<Partial<UserChoices>> ) => {
			state.choices = { ...state.choices, ...action.payload };
		},

		/**
		 * Set the exit type.
		 */
		setExitType: ( state, action: PayloadAction<ExitType> ) => {
			state.progress.exitType = action.payload;
		},

		/**
		 * Start the onboarding flow.
		 */
		startOnboarding: ( state ) => {
			state.progress.startedAt = Date.now();
			state.progress.exitType = null;
			state.hadUnexpectedExit = false;
		},

		/**
		 * Complete the onboarding flow.
		 */
		completeOnboarding: ( state ) => {
			state.progress.completedAt = Date.now();
			state.progress.exitType = 'user_exit';
		},

		/**
		 * Reset the onboarding state.
		 */
		resetOnboarding: ( state ) => {
			const initial = getInitialState();
			state.progress = initial.progress;
			state.choices = initial.choices;
			state.hadUnexpectedExit = false;
			state.error = null;
		},

		/**
		 * Set loading state.
		 */
		setLoading: ( state, action: PayloadAction<boolean> ) => {
			state.isLoading = action.payload;
		},

		/**
		 * Set error state.
		 */
		setError: ( state, action: PayloadAction<string | null> ) => {
			state.error = action.payload;
		},

		/**
		 * Update progress from server response.
		 */
		updateProgressFromServer: ( state, action: PayloadAction<Partial<UserProgress>> ) => {
			state.progress = { ...state.progress, ...action.payload };
		},

		/**
		 * Update choices from server response.
		 */
		updateChoicesFromServer: ( state, action: PayloadAction<UserChoices> ) => {
			state.choices = action.payload;
		},

		/**
		 * Clear unexpected exit flag.
		 */
		clearUnexpectedExit: ( state ) => {
			state.hadUnexpectedExit = false;
		},
	},
} );

// Export actions
export const {
	setCurrentStep,
	completeStep,
	setUserChoice,
	setUserChoices,
	setExitType,
	startOnboarding,
	completeOnboarding,
	resetOnboarding,
	setLoading,
	setError,
	updateProgressFromServer,
	updateChoicesFromServer,
	clearUnexpectedExit,
} = onboardingV2Slice.actions;

// Selectors
type RootState = { onboardingV2: OnboardingV2State };

export const selectCurrentStep = ( state: RootState ): number =>
	state.onboardingV2.progress.currentStep;

export const selectCompletedSteps = ( state: RootState ): number[] =>
	state.onboardingV2.progress.completedSteps;

export const selectUserChoices = ( state: RootState ): UserChoices =>
	state.onboardingV2.choices;

export const selectHadUnexpectedExit = ( state: RootState ): boolean =>
	state.onboardingV2.hadUnexpectedExit;

export const selectIsCompleted = ( state: RootState ): boolean =>
	state.onboardingV2.progress.completedAt !== null;

export const selectIsLoading = ( state: RootState ): boolean =>
	state.onboardingV2.isLoading;

export const selectError = ( state: RootState ): string | null =>
	state.onboardingV2.error;

export const selectProgress = ( state: RootState ): UserProgress =>
	state.onboardingV2.progress;

export const selectExitType = ( state: RootState ): ExitType =>
	state.onboardingV2.progress.exitType;

export default onboardingV2Slice.reducer;
