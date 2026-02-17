import { __createSelector, type SliceState } from '@elementor/store';

import { type slice } from './slice';

type State = SliceState< typeof slice >;

export const selectOnboarding = ( state: State ) => state.onboarding;

export const selectSteps = ( state: State ) => state.onboarding.steps;

export const selectCurrentStepId = ( state: State ) => state.onboarding.currentStepId;

export const selectCurrentStepIndex = ( state: State ) => state.onboarding.currentStepIndex;

export const selectCompletedSteps = ( state: State ) => state.onboarding.completedSteps;

export const selectChoices = ( state: State ) => state.onboarding.choices;

export const selectIsLoading = ( state: State ) => state.onboarding.isLoading;

export const selectError = ( state: State ) => state.onboarding.error;

export const selectHadUnexpectedExit = ( state: State ) => state.onboarding.hadUnexpectedExit;

export const selectIsConnected = ( state: State ) => state.onboarding.isConnected;

export const selectIsGuest = ( state: State ) => state.onboarding.isGuest;

export const selectUserName = ( state: State ) => state.onboarding.userName;

export const selectUrls = ( state: State ) => state.onboarding.urls;

export const selectShouldShowProInstallScreen = ( state: State ) => state.onboarding.shouldShowProInstallScreen;

export const selectHasSkippedProInstall = ( state: State ) => state.onboarding.hasSkippedProInstall;

export const selectCurrentStep = __createSelector(
	[ selectSteps, selectCurrentStepIndex ],
	( steps, index ) => steps[ index ] ?? null
);

export const selectIsFirstStep = __createSelector( [ selectCurrentStepIndex ], ( index ) => index === 0 );

export const selectIsLastStep = __createSelector(
	[ selectSteps, selectCurrentStepIndex ],
	( steps, index ) => index === steps.length - 1
);

export const selectTotalSteps = __createSelector( [ selectSteps ], ( steps ) => steps.length );

export const selectIsStepCompleted = __createSelector(
	[ selectCompletedSteps, ( _state: State, stepId: string ) => stepId ],
	( completedSteps, stepId ) => completedSteps.includes( stepId as never )
);

export const selectHasPassedLogin = __createSelector(
	[ selectIsConnected, selectIsGuest ],
	( isConnected, isGuest ) => isConnected || isGuest
);

export const selectShouldShowProInstall = __createSelector(
	[ selectIsConnected, selectShouldShowProInstallScreen, selectHasSkippedProInstall ],
	( isConnected, shouldShowProInstallScreen, hasSkipped ) =>
		isConnected && shouldShowProInstallScreen && ! hasSkipped
);
