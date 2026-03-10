import { invalidateDocumentData, isDocumentDirty } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { notify } from '@elementor/editor-notifications';
import { AxiosError } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

import { apiClient } from '../api';
import { type DocumentSaveStatus } from '../types';
import { getComponentDocuments } from '../utils/get-component-documents';

const INSUFFICIENT_PERMISSIONS_ERROR_CODE = 'insufficient_permissions';
const PUBLISH_UPGRADE_URL = 'https://go.elementor.com/go-pro-components-edit/';
const PUBLISH_UPGRADE_NOTIFICATION_ID = 'component-publish-upgrade';

type Options = {
	status: DocumentSaveStatus;
	elements: V1ElementData[];
};

export async function publishDraftComponentsInPageBeforeSave( { status, elements }: Options ) {
	if ( status !== 'publish' ) {
		return;
	}

	const documents = await getComponentDocuments( elements );

	const draftIds = [ ...documents.values() ].filter( isDocumentDirty ).map( ( document ) => document.id );

	if ( draftIds.length === 0 ) {
		return;
	}

	try {
		await apiClient.updateStatuses( draftIds, 'publish' );
	} catch ( error ) {
		if ( isInsufficientPermissionsError( error ) ) {
			notifyPublishUpgrade();
			return;
		}

		throw error;
	}

	draftIds.forEach( ( id ) => invalidateDocumentData( id ) );
}

function isInsufficientPermissionsError( error: unknown ): boolean {
	return error instanceof AxiosError && error.response?.data?.code === INSUFFICIENT_PERMISSIONS_ERROR_CODE;
}

function notifyPublishUpgrade() {
	notify( {
		type: 'promotion',
		id: PUBLISH_UPGRADE_NOTIFICATION_ID,
		message: __( 'You have unpublished component on this page. You need a pro version to publish it.', 'elementor' ),
		additionalActionProps: [
			{
				size: 'small',
				variant: 'contained',
				color: 'promotion',
				href: PUBLISH_UPGRADE_URL,
				target: '_blank',
				children: __( 'Upgrade Now', 'elementor' ),
			},
		],
	} );
}
