import { type V1ElementData } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import {
	type DocumentSaveStatus,
	type OverridableProps,
	type PublishedComponent,
	type UpdatedComponentNames,
} from './types';

const BASE_URL = 'elementor/v1/components';

export type CreateComponentPayload = {
	status: DocumentSaveStatus;
	items: Array< {
		uid: string;
		title: string;
		elements: V1ElementData[];
	} >;
};

type ComponentLockStatusResponse = {
	is_current_user_allow_to_edit: boolean;
	locked_by: string;
};

type GetComponentResponse = Array< PublishedComponent >;

export type CreateComponentResponse = Record< string, number >;

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
	updateStatuses: ( ids: number[], status: DocumentSaveStatus ) =>
		httpService().put( `${ BASE_URL }/status`, {
			ids,
			status,
		} ),
	getComponentConfig: ( id: number ) => ajax.load< { id: number }, V1ElementData >( getParams( id ) ),
	invalidateComponentConfigCache: ( id: number ) => ajax.invalidateCache< { id: number } >( getParams( id ) ),
	getComponentLockStatus: async ( componentId: number ) =>
		await httpService()
			.get< { data: ComponentLockStatusResponse } >( `${ BASE_URL }/lock-status`, {
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
			.post< { success: boolean } >( `${ BASE_URL }/lock`, {
				componentId,
			} )
			.then( ( res ) => res.data ),
	unlockComponent: async ( componentId: number ) =>
		await httpService()
			.post< { success: boolean } >( `${ BASE_URL }/unlock`, {
				componentId,
			} )
			.then( ( res ) => res.data ),
	getOverridableProps: async ( componentId: number ) =>
		await httpService()
			.get< HttpResponse< OverridableProps > >( `${ BASE_URL }/overridable-props`, {
				params: {
					componentId: componentId.toString(),
				},
			} )
			.then( ( res ) => res.data.data ),
	updateArchivedComponents: async ( componentIds: number[] ) =>
		await httpService()
			.post< { data: { failedIds: number[]; successIds: number[]; success: boolean } } >(
				`${ BASE_URL }/archive`,
				{
					componentIds,
				}
			)
			.then( ( res ) => res.data.data ),
	updateComponentTitle: ( updatedComponentNames: Array< UpdatedComponentNames > ) =>
		console.log( 'LOG:: enter API with updatedComponentNames', updatedComponentNames ) ||
		httpService()
			.post< { data: { failedIds: number[]; successIds: number[]; success: boolean } } >(
				`${ BASE_URL }/update-titles`,
				{
					components: updatedComponentNames,
				}
			)
			.then( ( res ) => res.data.data ),
};
