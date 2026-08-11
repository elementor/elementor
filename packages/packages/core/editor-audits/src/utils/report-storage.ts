import { getSessionStorageItem, setSessionStorageItem } from '@elementor/session';

import { REPORT_STORAGE_KEY_PREFIX } from '../constants';
import { type PageAuditReport } from '../types';

function getStorageKey( documentId: number ): string {
  return `${ REPORT_STORAGE_KEY_PREFIX }/${ documentId }`;
}

export function getPersistedReport( documentId: number ): PageAuditReport | null {
  return getSessionStorageItem< PageAuditReport >( getStorageKey( documentId ) ) ?? null;
}

export function persistReport( documentId: number, report: PageAuditReport ): void {
  setSessionStorageItem( getStorageKey( documentId ), report );
}
