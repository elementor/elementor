import { __createSlice, type PayloadAction, type SliceState } from '@elementor/store';

import type { ExitType, OnboardingState, UserChoices, UserProgress } from '../types';

function getWindowConfig() {
	const appConfig = window.elementorAppConfig?.onboarding;

	if ( appConfig ) {
		return appConfig;
	}

	return window.elementorOnboardingConfig;
}

function getInitialState(): OnboardingState {
	const config = getWindowConfig();

	if ( config ) {
		const progress = config.progress ?? {};

		return {
			progress: {
				currentStep: progress.currentStep ?? progress.current_step ?? 0,
				completedSteps: progress.completedSteps ?? progress.completed_steps ?? [],
				exitType: progress.exitType ?? progress.exit_type ?? null,
				lastActiveTimestamp: progress.lastActiveTimestamp ?? progress.last_active_timestamp ?? null,
				startedAt: progress.startedAt ?? progress.started_at ?? null,
				completedAt: progress.completedAt ?? progress.completed_at ?? null,
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

export const onboardingSlice = __createSlice( {
	name: 'onboarding',
	initialState: getInitialState(),
	reducers: {
		setCurrentStep: ( state, action: PayloadAction< number > ) => {
			state.progress.currentStep = action.payload;
		},

		completeStep: ( state, action: PayloadAction< number > ) => {
			const stepIndex = action.payload;

			if ( ! state.progress.completedSteps.includes( stepIndex ) ) {
				state.progress.completedSteps.push( stepIndex );
			}

			const totalSteps = 14;
			for ( let i = 0; i < totalSteps; i++ ) {
				if ( ! state.progress.completedSteps.includes( i ) ) {
					state.progress.currentStep = i;
					break;
				}
			}
		},

		setUserChoice: (
			state,
			action: PayloadAction< { key: keyof UserChoices; value: UserChoices[ keyof UserChoices ] } >
		) => {
			const { key, value } = action.payload;
			( state.choices as Record< string, unknown > )[ key ] = value;
		},

		setUserChoices: ( state, action: PayloadAction< Partial< UserChoices > > ) => {
			state.choices = { ...state.choices, ...action.payload };
		},

		setExitType: ( state, action: PayloadAction< ExitType > ) => {
			state.progress.exitType = action.payload;
		},

		startOnboarding: ( state ) => {
			state.progress.startedAt = Date.now();
			state.progress.exitType = null;
			state.hadUnexpectedExit = false;
		},

		completeOnboarding: ( state ) => {
			state.progress.completedAt = Date.now();
			state.progress.exitType = 'user_exit';
		},

		resetOnboarding: ( state ) => {
			const initial = getInitialState();
			state.progress = initial.progress;
			state.choices = initial.choices;
			state.hadUnexpectedExit = false;
			state.error = null;
		},

		setLoading: ( state, action: PayloadAction< boolean > ) => {
			state.isLoading = action.payload;
		},

		setError: ( state, action: PayloadAction< string | null > ) => {
			state.error = action.payload;
		},

		updateProgressFromServer: ( state, action: PayloadAction< Partial< UserProgress > > ) => {
			state.progress = { ...state.progress, ...action.payload };
		},

		updateChoicesFromServer: ( state, action: PayloadAction< UserChoices > ) => {
			state.choices = action.payload;
		},

		clearUnexpectedExit: ( state ) => {
			state.hadUnexpectedExit = false;
		},
	},
} );

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
} = onboardingSlice.actions;

export type State = SliceState< typeof onboardingSlice >;

export const selectCurrentStep = ( state: State ): number => state.onboarding.progress.currentStep;

export const selectCompletedSteps = ( state: State ): number[] => state.onboarding.progress.completedSteps;

export const selectUserChoices = ( state: State ): UserChoices => state.onboarding.choices;

export const selectHadUnexpectedExit = ( state: State ): boolean => state.onboarding.hadUnexpectedExit;

export const selectIsCompleted = ( state: State ): boolean => state.onboarding.progress.completedAt !== null;

export const selectIsLoading = ( state: State ): boolean => state.onboarding.isLoading;

export const selectError = ( state: State ): string | null => state.onboarding.error;

export const selectProgress = ( state: State ): UserProgress => state.onboarding.progress;

export const selectExitType = ( state: State ): ExitType => state.onboarding.progress.exitType;
