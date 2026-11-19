const HORIZONTAL_STEPS: Record< string, number > = { ArrowRight: 1, ArrowLeft: -1 };
const VERTICAL_STEPS: Record< string, number > = { ArrowDown: 1, ArrowUp: -1 };

type Params = {
	items: HTMLElement[];
	current: HTMLElement;
	key: string;
	columns: number;
	isRtl: boolean;
};

export function getNavigationTarget( { items, current, key, columns, isRtl }: Params ) {
	const index = items.indexOf( current );

	if ( index === -1 ) {
		return null;
	}

	const horizontalStep = HORIZONTAL_STEPS[ key ];

	if ( horizontalStep ) {
		return items[ index + ( isRtl ? -horizontalStep : horizontalStep ) ] ?? null;
	}

	const verticalStep = VERTICAL_STEPS[ key ];

	if ( ! verticalStep ) {
		return null;
	}

	return current.dataset.navItem === 'tile'
		? getVerticalTileTarget( items, current, verticalStep, columns )
		: items[ index + verticalStep ] ?? null;
}

function getVerticalTileTarget( items: HTMLElement[], current: HTMLElement, step: number, columns: number ) {
	const groupItems = items.filter( ( item ) => item.dataset.groupId === current.dataset.groupId );
	const tiles = groupItems.filter( ( item ) => item.dataset.navItem === 'tile' );
	const sameColumnTile = tiles[ tiles.indexOf( current ) + step * columns ];

	if ( sameColumnTile ) {
		return sameColumnTile;
	}

	if ( step < 0 ) {
		return groupItems.find( ( item ) => item.dataset.navItem === 'header' ) ?? null;
	}

	return items[ items.indexOf( tiles[ tiles.length - 1 ] ) + 1 ] ?? null;
}
