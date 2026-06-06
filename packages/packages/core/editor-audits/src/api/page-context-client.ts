import { httpService } from '@elementor/http-client';

import { type PageContextResponse } from '../types';
import { getWindowConfig } from '../utils/window-config';

export async function fetchPageContext( documentId: number, attachmentIds: number[] ): Promise< PageContextResponse > {
	const { restNamespace, nonce } = getWindowConfig();
	const url = `${ restNamespace }/audits/page-context`;

	const response = await httpService().get< PageContextResponse >( url, {
		params: {
			document_id: documentId,
			attachment_ids: attachmentIds,
		},
		headers: { 'X-WP-Nonce': nonce },
	} );

	return response.data;
}
