import { httpService } from '@elementor/http-client';

import { type User } from './types';

const RESOURCE_URL = 'elementor/v1/user-data/current-user';

type GetUserPayload = {
	params?: { context?: 'edit' };
};

export type UserModel = {
	suppressedMessages: string[];
	capabilities: string[];
};

const getUserPayload: GetUserPayload = { params: { context: 'edit' } };

export const apiClient = {
	get: () =>
		httpService()
			.get< UserModel >( RESOURCE_URL, getUserPayload )
			.then( ( res ) => {
				const { capabilities = [], suppressedMessages = [] } = res.data;

				return { capabilities, suppressedMessages };
			} ),
	update: ( data: Partial< User > ) =>
		httpService().patch< Partial< UserModel > >( RESOURCE_URL, {
			suppressedMessages: data.suppressedMessages,
		} ),
};
