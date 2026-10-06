import { httpService } from '@elementor/http-client';

import { type PageContextResponse } from '../types';
import { isNonceInvalidError, refreshAuditsNonce } from '../utils/session-expiration';
import { getWindowConfig } from '../utils/window-config';

export async function fetchPageContext(
	documentId: number,
	imageSizeRequests: string[]
): Promise< PageContextResponse > {
	return requestPageContext( documentId, imageSizeRequests, true );
}

async function requestPageContext(
	documentId: number,
	imageSizeRequests: string[],
	allowNonceRetry: boolean
): Promise< PageContextResponse > {
	const { restNamespace, nonce } = getWindowConfig();
	const url = `${ restNamespace }/audits/page-context`;

	try {
		const response = await httpService().get< PageContextResponse >( url, {
			params: {
				document_id: documentId,
				image_size_requests: imageSizeRequests,
			},
			headers: { 'X-WP-Nonce': nonce },
		} );

		return response.data;
	} catch ( error ) {
		if ( ! allowNonceRetry || ! isNonceInvalidError( error ) ) {
			throw error;
		}

		await refreshAuditsNonce();

		return requestPageContext( documentId, imageSizeRequests, false );
	}
}
