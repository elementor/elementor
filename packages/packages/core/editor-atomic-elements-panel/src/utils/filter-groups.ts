import { type ElementGroup, type ElementTile } from './group-widgets';

export function filterGroups( groups: ElementGroup[], query: string ): ElementGroup[] {
	const normalizedQuery = query.trim().toLowerCase();

	if ( ! normalizedQuery ) {
		return groups;
	}

	return groups
		.map( ( group ) => ( {
			...group,
			tiles: group.tiles.filter( ( tile ) => matches( tile, normalizedQuery ) ),
		} ) )
		.filter( ( { tiles } ) => tiles.length > 0 );
}

function matches( tile: ElementTile, query: string ) {
	return [ tile.title, tile.widgetType, ...( tile.keywords ?? [] ) ].some( ( term ) =>
		term.toLowerCase().includes( query )
	);
}
