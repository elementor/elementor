import { isAngiePluginActive } from './is-angie-plugin-active';

export type AngieState = 'plugin' | 'sdk' | 'promo' | 'hidden';

const getEditorAngieConfig = () => window.elementorEditorAngie ?? {};

export const getAngieState = (): AngieState => {
	const config = getEditorAngieConfig();

	if ( ! config.isExperimentActive ) {
		return 'hidden';
	}

	if ( config.isUserDisabled || config.isBlockedBySite ) {
		return 'hidden';
	}

	if ( isAngiePluginActive() ) {
		return 'plugin';
	}

	if ( config.hasConsent ) {
		return 'sdk';
	}

	return 'promo';
};

export const isAngieEnabled = (): boolean => {
	const state = getAngieState();

	return state === 'plugin' || state === 'sdk';
};
