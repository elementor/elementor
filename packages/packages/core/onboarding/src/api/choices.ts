import apiFetch from '@wordpress/api-fetch';

import type { UserChoices } from '../types';

const BASE_PATH = '/elementor/v2/onboarding-v2/user-choices';

export interface ChoicesResponse {
	data: UserChoices;
}

export interface UpdateChoicesPayload {
	building_for?: string;
	site_type?: string;
	experience_level?: string;
	goals?: string[];
	features?: string[];
	design_preference?: string;
	template_choice?: string;
	connected_account?: boolean;
	site_name?: string;
	custom_data?: Record<string, unknown>;
}

export interface UpdateChoicesResponse {
	data: string;
	choices: UserChoices;
}

export const choicesApi = {
	get: (): Promise<ChoicesResponse> =>
		apiFetch( { path: BASE_PATH } ),

	update: ( payload: UpdateChoicesPayload ): Promise<UpdateChoicesResponse> =>
		apiFetch( {
			path: BASE_PATH,
			method: 'PATCH',
			data: payload,
		} ),
};
