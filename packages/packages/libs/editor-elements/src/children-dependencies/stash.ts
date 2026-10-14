import { getSessionStorageItem, removeSessionStorageItem, setSessionStorageItem } from '@elementor/session';

import { type V1ElementData } from '../sync/types';
import { type ChildrenStash } from './types';

const STASH_KEY_PREFIX = 'elementor/editor-state';
const STASH_KEY_SEGMENT = 'children-deps';

export function createChildrenStash(): ChildrenStash {
	return {
		get( elementId, childType ) {
			return getSessionStorageItem< V1ElementData >( buildStashKey( elementId, childType ) );
		},
		save( elementId, childType, data ) {
			setSessionStorageItem( buildStashKey( elementId, childType ), data );
		},
		clear( elementId, childType ) {
			removeSessionStorageItem( buildStashKey( elementId, childType ) );
		},
		clearAllForElement( elementId ) {
			const prefix = buildElementStashPrefix( elementId );

			for ( let index = sessionStorage.length - 1; index >= 0; index-- ) {
				const key = sessionStorage.key( index );

				if ( key?.startsWith( prefix ) ) {
					removeSessionStorageItem( key );
				}
			}
		},
	};
}

function buildStashKey( elementId: string, childType: string ): string {
	return `${ STASH_KEY_PREFIX }/${ elementId }/${ STASH_KEY_SEGMENT }/${ childType }`;
}

function buildElementStashPrefix( elementId: string ): string {
	return `${ STASH_KEY_PREFIX }/${ elementId }/${ STASH_KEY_SEGMENT }/`;
}
