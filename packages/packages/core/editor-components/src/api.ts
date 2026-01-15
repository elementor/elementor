import { type V1ElementData } from '@elementor/editor-elements';
import { ajax } from '@elementor/editor-v1-adapters';
import { type HttpResponse, httpService } from '@elementor/http-client';

import {
	type DocumentSaveStatus,
	type OverridableProps,
	type PublishedComponent,
	type UpdatedComponentName,
} from './types';

const BASE_URL = 'elementor/v1/components';

export type ComponentItems = Array< {
	uid: string;
	title: string;
	elements: V1ElementData[];
	settings?: {
		overridable_props?: OverridableProps;
	};
} >;

export type SyncPayload = {
	status: DocumentSaveStatus;
	created: ComponentItems;
	published: number[];
	archived: number[];
	renamed: UpdatedComponentName[];
};

type FailedItem = {
	id: number;
	error: string;
};

type CreatedFailedItem = {
	uid: string;
	error: string;
};

type OperationResult = {
	successIds: number[];
	failed: FailedItem[];
};

type CreatedResult = {
	success: Record< string, number >;
	failed: CreatedFailedItem[];
};

export type SyncResponse = {
	created: CreatedResult;
	published: OperationResult;
	archived: OperationResult;
	renamed: OperationResult;
};

type ComponentLockStatusResponse = {
	is_current_user_allow_to_edit: boolean;
	locked_by: string;
};

type GetComponentResponse = Array< PublishedComponent >;

export type ValidateComponentsPayload = {
	items: ComponentItems;
};

export type ValidateComponentsResponse = {
	code: string;
	message: string;
	data: {
		status: number;
		meta: Record< string, unknown >;
	};
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
	validate: async ( payload: ValidateComponentsPayload ) =>
		await httpService()
			.post< HttpResponse< ValidateComponentsResponse > >( `${ BASE_URL }/create-validate`, payload )
			.then( ( res ) => res.data ),
	sync: ( payload: SyncPayload ) =>
		httpService()
			.put< HttpResponse< SyncResponse > >( `${ BASE_URL }`, payload )
			.then( ( res ) => res.data.data ),
};
