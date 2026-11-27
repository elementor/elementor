import { type ClipboardElement, type StorageContent } from '../form-structure/utils';

type ClipboardWindow = { elementorCommon?: { storage?: { get: () => StorageContent } } };

export function getLocalClipboardElements( storageType?: string ): ClipboardElement[] | null {
	if ( storageType !== 'localstorage' ) {
		return null;
	}

	return ( window as ClipboardWindow ).elementorCommon?.storage?.get()?.clipboard?.elements ?? null;
}
