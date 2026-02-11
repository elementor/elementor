import { __createSlice, __registerSlice, type PayloadAction } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import type { OnboardingChoices, OnboardingState, Step, StepIdType, StepType } from '../types';
import { StepId } from '../types';

function getDefaultSteps(): Step[] {
	return [
		{ id: StepId.BUILDING_FOR, label: __( 'Who are you building for?', 'elementor' ), type: 'single' },
		{ id: StepId.SITE_ABOUT, label: __( 'What is your site about?', 'elementor' ), type: 'multiple' },
		{
			id: StepId.EXPERIENCE_LEVEL,
			label: __( 'How much experience do you have with Elementor?', 'elementor' ),
			type: 'single',
		},
		{
			id: StepId.THEME_SELECTION,
			label: __( 'Start with a theme that fits your needs', 'elementor' ),
			type: 'single',
		},
		{
			id: StepId.SITE_FEATURES,
			label: __( 'What do you want to include in your site?', 'elementor' ),
			type: 'multiple',
		},
	];
}

function parseStepsFromConfig( configSteps?: Array< { id: string; label: string; type?: string } > ): Step[] {
	if ( ! configSteps || configSteps.length === 0 ) {
		return getDefaultSteps();
	}

	return configSteps.map( ( step ) => ( {
		id: step.id as StepIdType,
		label: step.label,
		type: ( step.type as StepType ) || 'single',
	} ) );
}

function parseCompletedSteps( completedSteps?: string[] ): StepIdType[] {
	if ( ! completedSteps ) {
		return [];
	}
	return completedSteps as StepIdType[];
}

function getDefaultChoices(): OnboardingChoices {
	return {
		building_for: null,
		site_about: [],
		experience_level: null,
		theme_selection: null,
		site_features: [],
	};
}

function getEmptyState(): OnboardingState {
	const steps = getDefaultSteps();

	return {
		steps,
		currentStepId: steps[ 0 ]?.id ?? StepId.BUILDING_FOR,
		currentStepIndex: 0,
		completedSteps: [],
		exitType: null,
		lastActiveTimestamp: null,
		startedAt: null,
		completedAt: null,
		choices: getDefaultChoices(),
		isLoading: false,
		error: null,
		hadUnexpectedExit: false,
		isConnected: false,
		isGuest: false,
		userName: '',
		urls: { dashboard: '', editor: '', connect: '' },
	};
}

function buildStateFromConfig(
	config: NonNullable< typeof window.elementorAppConfig >[ 'e-onboarding' ]
): OnboardingState {
	if ( ! config ) {
		return getEmptyState();
	}

	const steps = parseStepsFromConfig( config.steps );
	const firstStepId = steps[ 0 ]?.id ?? StepId.BUILDING_FOR;
	const progress = config.progress ?? {};
	const currentStepIndex = progress.current_step_index ?? 0;
	const currentStepId = steps[ currentStepIndex ]?.id ?? ( progress.current_step_id as StepIdType ) ?? firstStepId;

	return {
		steps,
		currentStepId,
		currentStepIndex,
		completedSteps: parseCompletedSteps( progress.completed_steps ),
		exitType: progress.exit_type ?? null,
		lastActiveTimestamp: progress.last_active_timestamp ?? null,
		startedAt: progress.started_at ?? null,
		completedAt: progress.completed_at ?? null,
		choices: { ...getDefaultChoices(), ...config.choices },
		isLoading: false,
		error: null,
		hadUnexpectedExit: config.hadUnexpectedExit ?? false,
		isConnected: config.isConnected ?? false,
		isGuest: false,
		userName: config.userName ?? '',
		urls: config.urls ?? { dashboard: '', editor: '', connect: '' },
	};
}

export const slice = __createSlice( {
	name: 'onboarding',
	initialState: getEmptyState(),
	reducers: {
		initFromConfig: ( state ) => {
			const config = window.elementorAppConfig?.[ 'e-onboarding' ];

			if ( config ) {
				const newState = buildStateFromConfig( config );
				return newState;
			}

			return state;
		},

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

		setUserChoice: ( state, action: PayloadAction< { key: keyof OnboardingChoices; value: unknown } > ) => {
			const { key, value } = action.payload;
			( state.choices as Record< string, unknown > )[ key ] = value;
		},

		setUserChoices: ( state, action: PayloadAction< Partial< OnboardingChoices > > ) => {
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

		setGuest: ( state, action: PayloadAction< boolean > ) => {
			state.isGuest = action.payload;
		},
	},
} );

export const {
	initFromConfig,
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
	setGuest,
} = slice.actions;

export function registerOnboardingSlice() {
	__registerSlice( slice );
}
