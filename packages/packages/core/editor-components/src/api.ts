import { type V1ElementData } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type Component, type DocumentStatus } from './types';

const BASE_URL = 'elementor/v1/components';
const BASE_URL_IS_CURRENT_USER_LOCKED = `${ BASE_URL }/is-current-user-locked`;
const LOCK_COMPONENT = `${ BASE_URL }/lock`;
const UNLOCK_COMPONENT = `${ BASE_URL }/unlock`;
const BASE_URL_LOCK_STATUS = `${ BASE_URL }/lock-status`;

export type CreateComponentPayload = {
	name: string;
	content: V1ElementData[];
	status: DocumentStatus;
};

type ComponentLockStatusResponse = {
	locked: boolean;
	locked_by: string;
	locked_by_id: number;
};

type GetComponentResponse = Array< Component >;

export type CreateComponentResponse = {
	component_id: number;
};

export const getParams = ( id: number ) => ( {
	action: 'get_document_config',
	unique_id: `document-config-${ id }`,
	data: { id },
} );

export const apiClient = {
	get: () =>
		httpService()
			.get< HttpResponse< GetComponentResponse > >( `${ BASE_URL }` )
			.then( ( res ) => res.data.data ),
	create: ( payload: CreateComponentPayload ) =>
		httpService()
			.post< HttpResponse< CreateComponentResponse > >( `${ BASE_URL }`, payload )
			.then( ( res ) => res.data.data ),
	getComponentConfig: ( id: number ) => ajax.load< { id: number }, V1ElementData >( getParams( id ) ),
	invalidateComponentConfigCache: ( id: number ) => ajax.invalidateCache< { id: number } >( getParams( id ) ),
	getComponentLockStatus: async ( componentId: number ) =>
		await httpService()
			.get< { data: ComponentLockStatusResponse } >( `${ BASE_URL_LOCK_STATUS }`, {
				params: {
					componentId,
				},
			} )
			.then( ( res ) => res.data ),
	getComponentLockedUser: async ( componentId: number ) => {
		const response = await httpService()
			.get< { is_current_user_locked: boolean } >( BASE_URL_IS_CURRENT_USER_LOCKED, {
				params: {
					componentId,
				},
			} )
			.then( ( res ) => res.data );

		return response.is_current_user_locked;
	},
	lockComponent: async ( componentId: number ) =>
		await httpService()
			.post< { success: boolean } >( LOCK_COMPONENT, {
				componentId,
			} )
			.then( ( res ) => res.data ),
	unlockComponent: async ( componentId: number ) =>
		await httpService()
			.post< { success: boolean } >( UNLOCK_COMPONENT, {
				componentId,
			} )
			.then( ( res ) => res.data ),
};

export const canSwitchDocument = async (
	componentId: number
): Promise< {
	isAllowedToSwitchDocument: boolean;
	lockedBy: string;
} > => {
	const response = await apiClient.getComponentLockStatus( componentId );
	const { locked, locked_by: lockedBy } = response.data;
	if ( ! locked ) {
		return { isAllowedToSwitchDocument: true, lockedBy: '' };
	}

	const isCurrentUserLocked = await apiClient.getComponentLockedUser( componentId );
	if ( isCurrentUserLocked ) {
		return { isAllowedToSwitchDocument: true, lockedBy: '' };
	}
	return { isAllowedToSwitchDocument: false, lockedBy };
};
