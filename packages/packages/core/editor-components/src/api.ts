import { type V1ElementData } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import { type Component, type DocumentStatus } from './types';

const BASE_URL = 'elementor/v1/components';
const LOCK_COMPONENT = `${ BASE_URL }/lock`;
const UNLOCK_COMPONENT = `${ BASE_URL }/unlock`;
const BASE_URL_LOCK_STATUS = `${ BASE_URL }/lock-status`;

export type CreateComponentPayload = {
	status: DocumentStatus;
	items: Array< {
		temp_id: number;
		title: string;
		elements: V1ElementData[];
	} >;
};

type ComponentLockStatusResponse = {
	is_current_user_allow_to_edit: boolean;
	locked_by: string;
};

type GetComponentResponse = Array< Component >;

export type CreateComponentResponse = Record< number, number >;

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
			.then( ( res ) => {
				const { is_current_user_allow_to_edit: isAllowedToSwitchDocument, locked_by: lockedBy } = res.data.data;
				return { isAllowedToSwitchDocument, lockedBy: lockedBy || '' };
			} ),
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
