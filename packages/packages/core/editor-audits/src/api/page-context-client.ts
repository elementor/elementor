import { httpService } from '@elementor/http-client';

import { type PageContextResponse } from '../types';
import {
  isNonceInvalidError,
  refreshAuditsNonce,
  SessionExpiredError,
  showSessionExpiredModal,
} from '../utils/session-expiration';
import { getWindowConfig } from '../utils/window-config';

export async function fetchPageContext(
  documentId: number,
  attachmentIds: number[]
): Promise< PageContextResponse > {
  return requestPageContext( documentId, attachmentIds, true );
}

async function requestPageContext(
  documentId: number,
  attachmentIds: number[],
  allowNonceRetry: boolean
): Promise< PageContextResponse > {
  const { restNamespace, nonce } = getWindowConfig();
  const url = `${ restNamespace }/audits/page-context`;

  try {
    const response = await httpService().get< PageContextResponse >( url, {
      params: {
        document_id: documentId,
        attachment_ids: attachmentIds,
      },
      headers: { 'X-WP-Nonce': nonce },
    } );

    return response.data;
  } catch ( error ) {
    if ( ! allowNonceRetry || ! isNonceInvalidError( error ) ) {
      throw error;
    }

    try {
      await refreshAuditsNonce();
    } catch ( refreshError ) {
      if ( refreshError instanceof SessionExpiredError ) {
        showSessionExpiredModal();
      }
      throw refreshError;
    }

    return requestPageContext( documentId, attachmentIds, false );
  }
}
