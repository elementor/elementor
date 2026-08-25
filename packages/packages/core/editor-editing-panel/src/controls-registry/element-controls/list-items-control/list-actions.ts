import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
	createElements,
	duplicateElements,
	getContainer,
	moveElements,
	removeElements,
} from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

export type ListItem = {
	id: string;
	title?: string;
};

export const LIST_ITEM_ELEMENT_TYPE = 'e-list-item';

const TRAILING_NUMBER = /(\d+)\s*$/;

const getItemTitle = ( position: number ) => `Item ${ position }`;

const getNextItemNumber = ( existingTitles: ( string | undefined )[] ) => {
	const taken = new Set( existingTitles.filter( ( title ): title is string => Boolean( title ) ) );

	const highest = existingTitles.reduce( ( max: number, title ) => {
		const [ , trailingNumber ] = title?.match( TRAILING_NUMBER ) ?? [];
		const parsed = trailingNumber ? Number( trailingNumber ) : 0;

		return Number.isFinite( parsed ) && parsed > max ? parsed : max;
	}, 0 );

	let next = highest + 1;

	while ( taken.has( getItemTitle( next ) ) ) {
		next += 1;
	}

	return next;
};

export const duplicateItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
	duplicateElements( {
		elementIds: items.map( ( { item } ) => item.id ),
		title: __( 'Duplicate List Item', 'elementor' ),
	} );
};

export const moveItem = ( {
	toIndex,
	listContainerId,
	movedElementId,
}: {
	toIndex: number;
	listContainerId: string;
	movedElementId: string;
} ) => {
	const movedElement = getContainer( movedElementId );
	const listContainer = getContainer( listContainerId );

	if ( ! movedElement || ! listContainer ) {
		throw new Error( 'List item or list container not found' );
	}

	moveElements( {
		title: __( 'Reorder List Items', 'elementor' ),
		moves: [
			{
				element: movedElement,
				targetContainer: listContainer,
				options: { at: toIndex },
			},
		],
	} );
};

export const removeItem = ( { items }: { items: ItemsActionPayload< ListItem > } ) => {
	removeElements( {
		title: __( 'List Items', 'elementor' ),
		elementIds: items.map( ( { item } ) => item.id ),
	} );
};

export const addItem = ( {
	existingTitles,
	listContainerId,
	items,
	showMarkers,
}: {
	existingTitles: ( string | undefined )[];
	listContainerId: string;
	items: ItemsActionPayload< ListItem >;
	showMarkers: boolean;
} ) => {
	const listContainer = getContainer( listContainerId );

	if ( ! listContainer ) {
		throw new Error( 'List container not found' );
	}

	const titles = [ ...existingTitles ];

	items.forEach( ( { index } ) => {
		const position = getNextItemNumber( titles );

		createElements( {
			title: __( 'List Items', 'elementor' ),
			elements: [
				{
					container: listContainer,
					model: {
						elType: LIST_ITEM_ELEMENT_TYPE,
						settings: {
							show_markers: showMarkers,
						},
						hydrateDefaultChildren: true,
						editor_settings: {
							title: getItemTitle( position ),
							initial_position: position,
						},
					},
					options: { at: index },
				},
			],
		} );

		titles.push( getItemTitle( position ) );
	} );
};
