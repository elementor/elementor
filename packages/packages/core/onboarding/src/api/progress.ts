import apiFetch from '@wordpress/api-fetch';

import type { UserProgress } from '../types';

const BASE_PATH = '/elementor/v2/onboarding-v2/user-progress';

export interface ProgressResponse {
	data: UserProgress;
	meta: {
		had_unexpected_exit: boolean;
	};
}

export interface UpdateProgressPayload {
	current_step?: number;
	completed_steps?: number[];
	exit_type?: 'user_exit' | 'unexpected' | null;
	complete_step?: number;
	total_steps?: number;
	start?: boolean;
	complete?: boolean;
	user_exit?: boolean;
}

export interface UpdateProgressResponse {
	data: string;
	progress: UserProgress;
}

export const progressApi = {
	get: (): Promise<ProgressResponse> =>
		apiFetch( { path: BASE_PATH } ),

	update: ( payload: UpdateProgressPayload ): Promise<UpdateProgressResponse> =>
		apiFetch( {
			path: BASE_PATH,
			method: 'PATCH',
			data: payload,
		} ),
};
