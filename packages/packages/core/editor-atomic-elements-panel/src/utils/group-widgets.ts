import { __ } from '@wordpress/i18n';

import { type WidgetConfig, type WidgetsCache } from './get-atomic-widgets';

export type ElementTile = {
	elType: string;
	widgetType: string;
	title: string;
	icon?: string;
	keywords?: string[];
	settings?: Record< string, unknown >;
	categories?: string[];
	custom?: WidgetConfig[ 'custom' ];
	editable?: boolean;
	showInPanel?: boolean;
	hideOnSearch?: boolean;
	atomic?: boolean;
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

export const FALLBACK_GROUP_ID = 'v4-elements';
const FORM_GROUP_ID = 'form';
const FORM_CATEGORY = 'atomic-form';

const GROUPS: { id: string; title: string; widgetTypes: string[] }[] = [
	{ id: 'layout', title: __( 'Layout', 'elementor' ), widgetTypes: [ 'e-div-block', 'e-flexbox', 'e-grid' ] },
	{
		id: 'basic',
		title: __( 'Basic', 'elementor' ),
		widgetTypes: [ 'e-heading', 'e-paragraph', 'e-image', 'e-svg', 'e-button', 'e-divider' ],
	},
	{
		id: 'media',
		title: __( 'Media', 'elementor' ),
		widgetTypes: [ 'e-youtube', 'e-self-hosted-video', 'e-background-video', 'e-google-maps' ],
	},
	{
		id: 'interactive',
		title: __( 'Interactive', 'elementor' ),
		widgetTypes: [ 'e-tabs', 'e-accordion', 'e-list', 'e-menu', 'e-collection-loop', 'e-carousel' ],
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
				keywords: widget.keywords,
				settings: widget.custom?.isPreset ? widget.custom.preset_settings : undefined,
				categories: widget.categories,
				custom: widget.custom,
				editable: widget.editable,
				showInPanel: widget.show_in_panel,
				hideOnSearch: widget.hide_on_search,
				atomic: !! widget.atomic,
			},
		} ) ),
		...lockedTiles.map( ( { tile, categories } ) => ( {
			groupId: resolveGroupId( tile.widgetType, categories ),
			tile,
		} ) ),
	];

	const seenWidgetTypes = new Set< string >();

	placedTiles.forEach( ( { groupId, tile } ) => {
		if ( seenWidgetTypes.has( tile.widgetType ) ) {
			return;
		}

		seenWidgetTypes.add( tile.widgetType );
		tilesByGroup.set( groupId, [ ...( tilesByGroup.get( groupId ) ?? [] ), tile ] );
	} );

	return GROUPS.filter( ( { id } ) => tilesByGroup.has( id ) ).map( ( { id, title, widgetTypes } ) => ( {
		id,
		title,
		tiles: sortByInventory( tilesByGroup.get( id ) ?? [], widgetTypes ),
	} ) );
}

function sortByInventory( tiles: ElementTile[], widgetTypes: string[] ) {
	const position = ( { widgetType }: ElementTile ) => {
		const index = widgetTypes.indexOf( widgetType );

		return index === -1 ? Infinity : index;
	};

	// Array.prototype.sort is stable, so unlisted tiles keep their original order after the listed ones.
	return [ ...tiles ].sort( ( a, b ) => {
		const [ positionA, positionB ] = [ position( a ), position( b ) ];

		return positionA === positionB ? 0 : positionA < positionB ? -1 : 1;
	} );
}

function resolveGroupId( widgetType: string, categories: string[] = [] ) {
	const mappedGroup = GROUPS.find( ( group ) => group.widgetTypes.includes( widgetType ) );

	if ( mappedGroup ) {
		return mappedGroup.id;
	}

	return categories.includes( FORM_CATEGORY ) ? FORM_GROUP_ID : FALLBACK_GROUP_ID;
}
