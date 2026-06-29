import { useMemo } from 'react';

import type {
	ErrorReportedTarget,
	ObSummarySnapshot,
	SiteStarterInteractionResult,
	SiteStarterTargetName,
} from '../analytics/events';
import {
	flushQueue,
	trackBackClicked,
	trackConnect,
	trackErrorReported,
	trackExperienceSelected,
	trackLoginType,
	trackOnboardingInitialized,
	trackPersonaSelected,
	trackProFeaturesSelected,
	trackProInstall,
	trackResumeOnboarding,
	trackSiteStarterSelected,
	trackSiteTopicSelected,
	trackSkipClicked,
	trackStepViewed,
	trackSummary,
	trackThemeSelected,
	trackThemeSuggested,
	trackUpgradeClicked,
} from '../analytics/onboarding-tracking';
import { useTrackingState } from '../analytics/tracking-context';

export function useOnboardingEvent() {
	const { isActive, activate } = useTrackingState();

	return useMemo(
		() => ( {
			trackOnboardingInitialized: () => trackOnboardingInitialized( isActive ),
			trackLoginType: ( loginType: 'social_login' | 'elementor_login' | 'guest' ) =>
				trackLoginType( isActive, loginType ),
			trackConnect: ( success: boolean, error?: string ) => trackConnect( isActive, success, error ),
			trackProInstall: ( action: 'install' | 'later' ) => trackProInstall( isActive, action ),
			trackStepViewed: ( viewedStepId: string ) => trackStepViewed( isActive, viewedStepId ),
			trackPersonaSelected: ( value: string ) => trackPersonaSelected( isActive, value ),
			trackSiteTopicSelected: ( topics: string[] ) => trackSiteTopicSelected( isActive, topics ),
			trackExperienceSelected: ( level: string ) => trackExperienceSelected( isActive, level ),
			trackThemeSuggested: ( theme: string ) => trackThemeSuggested( isActive, theme ),
			trackThemeSelected: ( theme: string ) => trackThemeSelected( isActive, theme ),
			trackProFeaturesSelected: ( params: {
				targetName: 'continue_with_free' | 'compare plans';
				features: string[];
			} ) => trackProFeaturesSelected( isActive, params ),
			trackBackClicked: ( currentStepId: string ) => trackBackClicked( isActive, currentStepId ),
			trackSkipClicked: ( currentStepId: string ) => trackSkipClicked( isActive, currentStepId ),
			trackUpgradeClicked: ( currentStepId: string ) => trackUpgradeClicked( isActive, currentStepId ),
			trackResumeOnboarding: ( resumeStepId: string ) => trackResumeOnboarding( isActive, resumeStepId ),
			trackSiteStarterSelected: ( params: {
				targetName: SiteStarterTargetName;
				interactionResult: SiteStarterInteractionResult;
			} ) => trackSiteStarterSelected( isActive, params ),
			trackSummary: ( snapshot: ObSummarySnapshot ) => trackSummary( isActive, snapshot ),
			trackErrorReported: ( params: ErrorReportedTarget & { stepId: string; errorBody: string } ) =>
				trackErrorReported( isActive, params ),
			activateTracking: activate,
			flushQueue,
		} ),
		[ isActive, activate ]
	);
}
