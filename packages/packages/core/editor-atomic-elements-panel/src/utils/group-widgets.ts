import { __ } from '@wordpress/i18n';

import { type WidgetsCache } from './get-atomic-widgets';

export type ElementTile = {
	elType: string;
	widgetType: string;
	title: string;
	icon?: string;
	settings?: Record< string, unknown >;
	promotionType?: string;
};

export type PromotionTile = {
	tile: ElementTile;
	categories: string[];
};

export type ElementGroup = {
	id: string;
	title: string;
	tiles: ElementTile[];
};

const FALLBACK_GROUP_ID = 'v4-elements';
const FORM_GROUP_ID = 'form';
const FORM_CATEGORY = 'atomic-form';

const GROUPS: { id: string; title: string; widgetTypes: string[] }[] = [
	{ id: 'layout', title: __( 'Layout', 'elementor' ), widgetTypes: [ 'e-flexbox', 'e-div-block', 'e-grid' ] },
	{
		id: 'basic',
		title: __( 'Basic', 'elementor' ),
		widgetTypes: [ 'e-heading', 'e-paragraph', 'e-image', 'e-svg', 'e-button', 'e-divider' ],
	},
	{
		id: 'media',
		title: __( 'Media', 'elementor' ),
		widgetTypes: [ 'e-self-hosted-video', 'e-background-video', 'e-youtube', 'e-google-maps' ],
	},
	{
		id: 'interactive',
		title: __( 'Interactive', 'elementor' ),
		widgetTypes: [ 'e-tabs', 'e-accordion', 'e-menu', 'e-list', 'e-collection-loop', 'e-carousel' ],
	},
	{ id: FORM_GROUP_ID, title: __( 'Form', 'elementor' ), widgetTypes: [ 'e-form' ] },
	{ id: FALLBACK_GROUP_ID, title: __( 'Atomic Elements', 'elementor' ), widgetTypes: [] },
];

export function groupWidgets( widgets: WidgetsCache, lockedTiles: PromotionTile[] = [] ): ElementGroup[] {
	const tilesByGroup = new Map< string, ElementTile[] >();

	const placedTiles = [
		...Object.entries( widgets ).map( ( [ widgetType, widget ] ) => ( {
			groupId: resolveGroupId( widgetType, widget.categories ),
			tile: {
				elType: widget.elType ?? 'widget',
				widgetType,
				title: widget.title,
				icon: widget.icon,
				settings: widget.custom?.isPreset ? widget.custom.preset_settings : undefined,
			},
		} ) ),
		...lockedTiles.map( ( { tile, categories } ) => ( {
			groupId: resolveGroupId( tile.widgetType, categories ),
			tile,
		} ) ),
	];

	placedTiles.forEach( ( { groupId, tile } ) => {
		tilesByGroup.set( groupId, [ ...( tilesByGroup.get( groupId ) ?? [] ), tile ] );
	} );

	return GROUPS.filter( ( { id } ) => tilesByGroup.has( id ) ).map( ( { id, title } ) => ( {
		id,
		title,
		tiles: tilesByGroup.get( id ) ?? [],
	} ) );
}

function resolveGroupId( widgetType: string, categories: string[] = [] ) {
	const mappedGroup = GROUPS.find( ( group ) => group.widgetTypes.includes( widgetType ) );

	if ( mappedGroup ) {
		return mappedGroup.id;
	}

	return categories.includes( FORM_CATEGORY ) ? FORM_GROUP_ID : FALLBACK_GROUP_ID;
}
