import { type ItemsActionPayload } from '@elementor/editor-controls';
import {
	type CreateElementParams,
	createElements,
	duplicateElements,
	generateElementId,
	getContainer,
	moveElements,
	removeElements,
	type V1ElementData,
} from '@elementor/editor-elements';
import { booleanPropTypeUtil } from '@elementor/editor-props';
import { __, sprintf } from '@wordpress/i18n';

export type AccordionItem = {
	id: string;
	title?: string;
};

export const ACCORDION_ELEMENT_TYPE = 'e-accordion';
export const ACCORDION_ITEM_ELEMENT_TYPE = 'e-accordion-item';

const ACCORDION_ITEM_HEADER_ELEMENT_TYPE = 'e-accordion-item-header';
const ACCORDION_ITEM_TITLE_ELEMENT_TYPE = 'e-accordion-item-title';
const ACCORDION_ITEM_ICON_ELEMENT_TYPE = 'e-accordion-item-icon';
const ACCORDION_ITEM_CONTENT_ELEMENT_TYPE = 'e-accordion-item-content';
const PARAGRAPH_WIDGET_TYPE = 'e-paragraph';

const getItemTitle = ( position: number ) =>
	/* translators: %d: Accordion item position. */
	sprintf( __( 'Accordion Item %d', 'elementor' ), position );

const TRAILING_NUMBER = /(\d+)\s*$/;

// Picks the number for a newly added item from the titles that exist right now, never from how many
// items there are.
//
// The Repeater's add action reports `index = items.length`, i.e. the current visible count. Deriving
// the number from that collides after a delete: remove "Accordion Item 1" from the default pair and
// the count drops to 1, so the next add would be numbered 2 — a duplicate of the surviving
// "Accordion Item 2". The number is not just a Structure-panel label, it is baked into the item's
// rendered paragraph, so the canvas would show two identical headers.
//
// Taking `max( trailing number of each existing title ) + 1` keeps the surviving item in view when
// the number is chosen, which is what fixes that case. The final loop then guarantees the property
// we actually care about — the new title differs from every title currently present — even when a
// user has renamed items by hand. It cannot know about numbers used by items that were already
// deleted, so a delete-the-highest-then-add sequence can still reuse a number; that reuse is never a
// visible duplicate, which is the failure that matters.
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

// Builds one `e-accordion-item` subtree, mirroring `Atomic_Accordion::build_default_item()`.
//
// Each level of an atomic element's default children is hydrated independently
// (`AtomicElementBaseModel.onElementCreate()`), so the title slot's own defaults cannot know which
// item they belong to and would render an unnumbered "Accordion Item". Spelling the
// item -> header -> title -> paragraph chain out here is what lets the numbered text reach the
// rendered paragraph, exactly as the default two-item tree does. The icon and content branches need
// no per-index content, so they keep hydrating their own defaults.
//
// `V1ElementData` is the plain-object form of a model tree: nested `elements` are objects that
// Backbone turns into models on `initialize`, and ids have to be generated here because only the
// outermost model gets one from `document/elements/create`.
const buildItemModel = ( position: number, showIcon: boolean ): V1ElementData => {
	const numberedTitle = getItemTitle( position );

	return {
		elType: ACCORDION_ITEM_ELEMENT_TYPE,
		id: generateElementId(),
		editor_settings: { title: numberedTitle, initial_position: position },
		elements: [
			{
				elType: ACCORDION_ITEM_HEADER_ELEMENT_TYPE,
				id: generateElementId(),
				editor_settings: { title: __( 'Header', 'elementor' ) },
				// Seeded from the root's *current* `show_icon` value, not the schema default: if a user
				// has already turned Show Icon off, a newly added item must start with its icon hidden
				// too, not re-show one just because the item itself is brand new. See the comment on
				// the mirrored prop in `Atomic_Accordion_Item_Header` for why this duplication exists.
				settings: { show_icon: booleanPropTypeUtil.create( showIcon ) },
				elements: [
					{
						elType: ACCORDION_ITEM_TITLE_ELEMENT_TYPE,
						id: generateElementId(),
						editor_settings: { title: __( 'Title', 'elementor' ) },
						elements: [
							{
								elType: 'widget',
								widgetType: PARAGRAPH_WIDGET_TYPE,
								id: generateElementId(),
								// A leaf still needs an explicit empty `elements`: `ElementModel.initialize()` only
								// turns the attribute into a collection when it is defined, and v1 code walking a
								// subtree (`deselectRecursive()` on delete) calls `.forEach()` on it unguarded.
								elements: [],
								settings: {
									paragraph: {
										$$type: 'html-v3',
										value: {
											content: { $$type: 'string', value: numberedTitle },
											children: [],
										},
									},
									tag: { $$type: 'string', value: 'span' },
								},
							},
						],
					},
					{
						elType: ACCORDION_ITEM_ICON_ELEMENT_TYPE,
						id: generateElementId(),
						editor_settings: { title: __( 'Icon', 'elementor' ) },
						elements: [],
						hydrateDefaultChildren: true,
					},
				],
			},
			{
				elType: ACCORDION_ITEM_CONTENT_ELEMENT_TYPE,
				id: generateElementId(),
				editor_settings: { title: __( 'Content', 'elementor' ) },
				elements: [],
				hydrateDefaultChildren: true,
			},
		],
	};
};

export const useActions = () => {
	const addItem = ( {
		accordionId,
		existingTitles,
		items,
		showIcon,
	}: {
		accordionId: string;
		existingTitles: ( string | undefined )[];
		items: ItemsActionPayload< AccordionItem >;
		// The root's *current* `show_icon` value, so the new item's header starts in sync with it
		// instead of the schema default - see the comment on `buildItemModel`.
		showIcon: boolean;
	} ) => {
		const accordion = getContainer( accordionId );

		if ( ! accordion ) {
			throw new Error( 'Accordion container not found' );
		}

		// Grows as we go, so adding several items in one action can't hand out the same number twice.
		const titles = [ ...existingTitles ];

		items.forEach( () => {
			const position = getNextItemNumber( titles );

			createElements( {
				title: __( 'Accordion', 'elementor' ),
				elements: [
					{
						container: accordion,
						// `buildItemModel()` returns `V1ElementData`, whose `elements` field is plain nested
						// data (`V1ElementData[]`) - correct for a tree we're constructing to send as a
						// creation payload. `CreateElementParams['model']` is derived from
						// `V1ElementModelProps`, whose `elements` field is typed as `V1Model<...>[]` - live
						// Backbone-model wrappers with `get`/`set`/`toJSON`, the shape for reading an
						// *existing* element out of the document, not for describing one to create. A single
						// cast is enough (the two types overlap enough for TS to allow it directly); no
						// `unknown` escape hatch needed.
						model: buildItemModel( position, showIcon ) as CreateElementParams[ 'model' ],
					},
				],
			} );

			titles.push( getItemTitle( position ) );
		} );
	};

	const removeItem = ( { items }: { items: ItemsActionPayload< AccordionItem > } ) => {
		removeElements( {
			title: __( 'Accordion', 'elementor' ),
			elementIds: items.map( ( { item } ) => item.id ),
		} );
	};

	const duplicateItem = ( { items }: { items: ItemsActionPayload< AccordionItem > } ) => {
		duplicateElements( {
			title: __( 'Duplicate Accordion Item', 'elementor' ),
			elementIds: items.map( ( { item } ) => item.id ),
		} );
	};

	const moveItem = ( {
		accordionId,
		movedElementId,
		toIndex,
	}: {
		accordionId: string;
		movedElementId: string;
		toIndex: number;
	} ) => {
		const accordion = getContainer( accordionId );
		const movedElement = getContainer( movedElementId );

		if ( ! accordion || ! movedElement ) {
			throw new Error( 'Accordion item or container not found' );
		}

		moveElements( {
			title: __( 'Reorder Accordion Items', 'elementor' ),
			moves: [
				{
					element: movedElement,
					targetContainer: accordion,
					options: { at: toIndex },
				},
			],
		} );
	};

	return {
		addItem,
		removeItem,
		duplicateItem,
		moveItem,
	};
};
