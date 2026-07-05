import type { ElementNode } from './types';

const ID_LENGTH = 7;

export function generateElementId( existingIds: string[] = [] ): string {
	const existing = new Set( existingIds );
	let id = '';

	do {
		id = Math.random().toString( 16 ).slice( 2, 2 + ID_LENGTH );
	} while ( existing.has( id ) );

	return id;
}

export function collectElementIds( elements: ElementNode[] ): string[] {
	const ids: string[] = [];

	const walk = ( nodes: ElementNode[] ) => {
		for ( const node of nodes ) {
			ids.push( node.id );

			if ( node.elements?.length ) {
				walk( node.elements );
			}
		}
	};

	walk( elements );

	return ids;
}
