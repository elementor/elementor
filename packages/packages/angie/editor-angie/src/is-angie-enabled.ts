import { useMemo } from 'react';

import { isAngiePluginActive } from './is-angie-plugin-active';

export type AngieState = 'plugin' | 'sdk' | 'promo' | 'hidden';

export type ElementorEditorAngieConfig = {
	hasConsent?: boolean;
	isAngiePluginActive?: boolean;
	isBlockedBySite?: boolean;
	isExperimentActive?: boolean;
	isPluginInstalled?: boolean;
	isUserDisabled?: boolean;
	showEntryPoints?: boolean;
};

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

export const useIsAngieEnabled = (): boolean => {
	return useMemo( () => isAngieEnabled(), [] );
};

export const useAngieState = (): AngieState => {
	return useMemo( () => getAngieState(), [] );
};
