import { __createSlice, __registerSlice, type PayloadAction } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import type { OnboardingChoices, OnboardingState, Step, StepIdType } from '../types';
import { StepId } from '../types';

function getDefaultSteps(): Step[] {
	return [
		{ id: StepId.BUILDING_FOR, label: __( 'Who are you building for?', 'elementor' ) },
		{ id: StepId.SITE_ABOUT, label: __( 'What is your site about?', 'elementor' ) },
		{ id: StepId.EXPERIENCE, label: __( 'How much experience do you have with Elementor?', 'elementor' ) },
		{ id: StepId.THEME_SELECT, label: __( 'Start with a theme that fits your needs', 'elementor' ) },
		{ id: StepId.SITE_FEATURES, label: __( 'What do you want to include in your site?', 'elementor' ) },
	];
}

function parseStepsFromConfig( configSteps?: Array< { id: string; label: string } > ): Step[] {
	if ( ! configSteps || configSteps.length === 0 ) {
		return getDefaultSteps();
	}

	return configSteps.map( ( step ) => ( {
		id: step.id as StepIdType,
		label: step.label,
	} ) );
}

function parseCompletedSteps( completedSteps?: string[] ): StepIdType[] {
	if ( ! completedSteps ) {
		return [];
	}
	return completedSteps as StepIdType[];
}

function getInitialState(): OnboardingState {
	const config = window.elementorAppConfig?.[ 'e-onboarding' ];
	const steps = parseStepsFromConfig( config?.steps );
	const firstStepId = steps[ 0 ]?.id ?? StepId.BUILDING_FOR;

	if ( config ) {
		const progress = config.progress ?? {};
		const currentStepId = ( progress.current_step_id as StepIdType ) || firstStepId;

		return {
			steps,
			currentStepId,
			currentStepIndex: progress.current_step_index ?? 0,
			completedSteps: parseCompletedSteps( progress.completed_steps ),
			exitType: progress.exit_type ?? null,
			lastActiveTimestamp: progress.last_active_timestamp ?? null,
			startedAt: progress.started_at ?? null,
			completedAt: progress.completed_at ?? null,
			choices: config.choices ?? {},
			isLoading: false,
			error: null,
			hadUnexpectedExit: config.hadUnexpectedExit ?? false,
			isConnected: config.isConnected ?? false,
			urls: config.urls ?? { dashboard: '', editor: '', connect: '' },
		};
	}

	return {
		steps,
		currentStepId: firstStepId,
		currentStepIndex: 0,
		completedSteps: [],
		exitType: null,
		lastActiveTimestamp: null,
		startedAt: null,
		completedAt: null,
		choices: {},
		isLoading: false,
		error: null,
		hadUnexpectedExit: false,
		isConnected: false,
		urls: { dashboard: '', editor: '', connect: '' },
	};
}

export const slice = __createSlice( {
	name: 'onboarding',
	initialState: getInitialState(),
	reducers: {
		goToStep: ( state, action: PayloadAction< StepIdType > ) => {
			const stepId = action.payload;
			const stepIndex = state.steps.findIndex( ( s ) => s.id === stepId );

			if ( stepIndex !== -1 ) {
				state.currentStepId = stepId;
				state.currentStepIndex = stepIndex;
			}
		},

		goToStepIndex: ( state, action: PayloadAction< number > ) => {
			const index = action.payload;

			if ( index >= 0 && index < state.steps.length ) {
				state.currentStepId = state.steps[ index ].id;
				state.currentStepIndex = index;
			}
		},

		nextStep: ( state ) => {
			const nextIndex = state.currentStepIndex + 1;

			if ( nextIndex < state.steps.length ) {
				state.currentStepId = state.steps[ nextIndex ].id;
				state.currentStepIndex = nextIndex;
			}
		},

		prevStep: ( state ) => {
			const prevIndex = state.currentStepIndex - 1;

			if ( prevIndex >= 0 ) {
				state.currentStepId = state.steps[ prevIndex ].id;
				state.currentStepIndex = prevIndex;
			}
		},

		completeStep: ( state, action: PayloadAction< StepIdType > ) => {
			const stepId = action.payload;

			if ( ! state.completedSteps.includes( stepId ) ) {
				state.completedSteps.push( stepId );
			}
		},

		setUserChoice: ( state, action: PayloadAction< { key: string; value: unknown } > ) => {
			state.choices[ action.payload.key ] = action.payload.value;
		},

		setUserChoices: ( state, action: PayloadAction< OnboardingChoices > ) => {
			state.choices = { ...state.choices, ...action.payload };
		},

		setExitType: ( state, action: PayloadAction< string | null > ) => {
			state.exitType = action.payload;
		},

		startOnboarding: ( state ) => {
			state.startedAt = Date.now();
			state.exitType = null;
			state.hadUnexpectedExit = false;
		},

		completeOnboarding: ( state ) => {
			state.completedAt = Date.now();
			state.exitType = 'user_exit';
		},

		setLoading: ( state, action: PayloadAction< boolean > ) => {
			state.isLoading = action.payload;
		},

		setError: ( state, action: PayloadAction< string | null > ) => {
			state.error = action.payload;
		},

		clearUnexpectedExit: ( state ) => {
			state.hadUnexpectedExit = false;
		},

		setConnected: ( state, action: PayloadAction< boolean > ) => {
			state.isConnected = action.payload;
		},
	},
} );

export const {
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
} = slice.actions;

export function registerOnboardingSlice() {
	__registerSlice( slice );
}
