import { httpService } from '@elementor/http-client';

import { type User } from './types';

const RESOURCE_URL = '/users/me';

type GetUserPayload = {
	params: { context?: 'edit' };
};

type UserModel = {
	elementor_introduction: Record< string, boolean >;
	capabilities: Partial< Record< string, true > >;
};

const getUserPayload: GetUserPayload = { params: { context: 'edit' } };

export const apiClient = {
	get: () =>
		httpService()
			.get< UserModel >( 'wp/v2' + RESOURCE_URL, getUserPayload )
			.then( ( res ) => {
				return responseToUser( res.data );
			} ),
	update: ( data: Partial< User > ) =>
		httpService().patch< Partial< UserModel > >( 'wp/v2' + RESOURCE_URL, userToRequest( data ) ),
};

const responseToUser = ( response: UserModel ): User => {
	return {
		suppressedMessages: Object.entries( response.elementor_introduction )
			.filter( ( [ , value ] ) => value )
			.map( ( [ message ] ) => message ),
		capabilities: Object.keys( response.capabilities ),
	};
};

const userToRequest = ( user: Partial< User > ): Partial< UserModel > => {
	return {
		elementor_introduction: user.suppressedMessages?.reduce(
			( acc, message ) => {
				acc[ message ] = true;

				return acc;
			},
			{} as Record< string, boolean >
		),
	};
};
