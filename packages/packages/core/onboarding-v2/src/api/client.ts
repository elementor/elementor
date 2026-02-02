/**
 * Onboarding V2 API Client
 *
 * REST API client for communicating with the WordPress backend.
 */

import type { UserProgress, UserChoices } from '../types';

/**
 * Get the API configuration from window.
 */
function getConfig() {
	const config = window.elementorOnboardingV2Config;

	if ( ! config ) {
		throw new Error( 'Onboarding V2 config not found' );
	}

	return {
		restUrl: config.restUrl,
		nonce: config.nonce,
	};
}

/**
 * Make a REST API request.
 */
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

/**
 * Fetch user progress from the server.
 */
export async function fetchUserProgress(): Promise<{
	data: UserProgress;
	meta: { had_unexpected_exit: boolean };
}> {
	return apiRequest( 'user-progress' );
}

/**
 * Update user progress on the server.
 */
export async function updateUserProgress(
	data: Partial<UserProgress> & {
		complete_step?: number;
		total_steps?: number;
		start?: boolean;
		complete?: boolean;
		user_exit?: boolean;
	}
): Promise<{ data: string; progress: UserProgress }> {
	// Convert camelCase to snake_case for PHP
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

/**
 * Fetch user choices from the server.
 */
export async function fetchUserChoices(): Promise<{ data: UserChoices }> {
	return apiRequest( 'user-choices' );
}

/**
 * Update user choices on the server.
 */
export async function updateUserChoices(
	choices: Partial<UserChoices>
): Promise<{ data: string; choices: UserChoices }> {
	// Convert camelCase to snake_case for PHP
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

/**
 * Mark step as completed and sync with server.
 */
export async function completeStepOnServer(
	stepIndex: number,
	totalSteps = 14
): Promise<{ data: string; progress: UserProgress }> {
	return updateUserProgress( {
		complete_step: stepIndex,
		total_steps: totalSteps,
	} );
}

/**
 * Start onboarding and sync with server.
 */
export async function startOnboardingOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	return updateUserProgress( { start: true } );
}

/**
 * Complete onboarding and sync with server.
 */
export async function completeOnboardingOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	return updateUserProgress( { complete: true } );
}

/**
 * Mark user exit and sync with server.
 */
export async function markUserExitOnServer(): Promise<{
	data: string;
	progress: UserProgress;
}> {
	// Dispatch event for the exit handler
	window.dispatchEvent( new CustomEvent( 'onboarding-v2-user-exit' ) );

	return updateUserProgress( { user_exit: true } );
}
