import type { UserProgress, UserChoices } from '../types';

function getConfig() {
	const appConfig = window.elementorAppConfig?.onboarding;

	if ( appConfig ) {
		return {
			restUrl: appConfig.restUrl,
			nonce: appConfig.nonce,
		};
	}

	const standaloneConfig = window.elementorOnboardingConfig;

	if ( standaloneConfig ) {
		return {
			restUrl: standaloneConfig.restUrl,
			nonce: standaloneConfig.nonce,
		};
	}

	throw new Error( 'Onboarding config not found' );
}

async function apiRequest<T>(
	endpoint: string,
	method: 'GET' | 'PATCH' = 'GET',
	body?: Record<string, unknown>
): Promise<T> {
	const { restUrl, nonce } = getConfig();

	const options: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			'X-WP-Nonce': nonce,
		},
	};

	if ( body && method !== 'GET' ) {
		options.body = JSON.stringify( body );
	}

	const response = await fetch( `${ restUrl }${ endpoint }`, options );

	if ( ! response.ok ) {
		throw new Error( `API request failed: ${ response.statusText }` );
	}

	return response.json();
}

export async function fetchUserProgress(): Promise<{
	data: UserProgress;
	meta: { had_unexpected_exit: boolean };
}> {
	return apiRequest( 'user-progress' );
}

export async function updateUserProgress(
	data: Partial<UserProgress> & {
		complete_step?: number;
		total_steps?: number;
		start?: boolean;
		complete?: boolean;
		user_exit?: boolean;
	}
): Promise<{ data: string; progress: UserProgress }> {
	const payload: Record<string, unknown> = {};

	if ( data.currentStep !== undefined ) {
		payload.current_step = data.currentStep;
	}

	if ( data.completedSteps !== undefined ) {
		payload.completed_steps = data.completedSteps;
	}

	if ( data.exitType !== undefined ) {
		payload.exit_type = data.exitType;
	}

	if ( data.complete_step !== undefined ) {
		payload.complete_step = data.complete_step;
	}

	if ( data.total_steps !== undefined ) {
		payload.total_steps = data.total_steps;
	}

	if ( data.start !== undefined ) {
		payload.start = data.start;
	}

	if ( data.complete !== undefined ) {
		payload.complete = data.complete;
	}

	if ( data.user_exit !== undefined ) {
		payload.user_exit = data.user_exit;
	}

	return apiRequest( 'user-progress', 'PATCH', payload );
}

export async function fetchUserChoices(): Promise<{ data: UserChoices }> {
	return apiRequest( 'user-choices' );
}

export async function updateUserChoices(
	choices: Partial<UserChoices>
): Promise<{ data: string; choices: UserChoices }> {
	const payload: Record<string, unknown> = {};

	if ( choices.buildingFor !== undefined ) {
		payload.building_for = choices.buildingFor;
	}

	if ( choices.siteType !== undefined ) {
		payload.site_type = choices.siteType;
	}

	if ( choices.experienceLevel !== undefined ) {
		payload.experience_level = choices.experienceLevel;
	}

	if ( choices.goals !== undefined ) {
		payload.goals = choices.goals;
	}

	if ( choices.features !== undefined ) {
		payload.features = choices.features;
	}

	if ( choices.designPreference !== undefined ) {
		payload.design_preference = choices.designPreference;
	}

	if ( choices.templateChoice !== undefined ) {
		payload.template_choice = choices.templateChoice;
	}

	if ( choices.connectedAccount !== undefined ) {
		payload.connected_account = choices.connectedAccount;
	}

	if ( choices.siteName !== undefined ) {
		payload.site_name = choices.siteName;
	}

	if ( choices.customData !== undefined ) {
		payload.custom_data = choices.customData;
	}

	return apiRequest( 'user-choices', 'PATCH', payload );
}

export async function completeStepOnServer(
	stepIndex: number,
	totalSteps = 14
): Promise<{ data: string; progress: UserProgress }> {
	return updateUserProgress( {
		complete_step: stepIndex,
		total_steps: totalSteps,
	} );
}

export async function startOnboardingOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	return updateUserProgress( { start: true } );
}

export async function completeOnboardingOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	return updateUserProgress( { complete: true } );
}

export async function markUserExitOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	window.dispatchEvent( new CustomEvent( 'onboarding-user-exit' ) );

	return updateUserProgress( { user_exit: true } );
}
