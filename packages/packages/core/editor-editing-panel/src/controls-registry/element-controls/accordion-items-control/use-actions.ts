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
import { __, sprintf } from '@wordpress/i18n';

export type AccordionItem = {
	id: string;
	title?: string;
};

export const ACCORDION_ELEMENT_TYPE = 'e-accordion';
export const ACCORDION_ITEM_ELEMENT_TYPE = 'e-accordion-item';

const ACCORDION_ITEM_HEAD_ELEMENT_TYPE = 'e-accordion-item-head';
const ACCORDION_ITEM_TITLE_ELEMENT_TYPE = 'e-accordion-item-title';
const ACCORDION_ITEM_ICON_ELEMENT_TYPE = 'e-accordion-item-icon';
const ACCORDION_ITEM_CONTENT_ELEMENT_TYPE = 'e-accordion-item-content';
const PARAGRAPH_WIDGET_TYPE = 'e-paragraph';

const getItemTitle = ( position: number ) =>
	/* translators: %d: Accordion item position. */
	sprintf( __( 'Accordion Item %d', 'elementor' ), position );

// Builds one `e-accordion-item` subtree, mirroring `Atomic_Accordion::build_default_item()`.
//
// Each level of an atomic element's default children is hydrated independently
// (`AtomicElementBaseModel.onElementCreate()`), so the title slot's own defaults cannot know which
// item they belong to and would render an unnumbered "Accordion Item". Spelling the
// item -> head -> title -> paragraph chain out here is what lets the numbered text reach the
// rendered paragraph, exactly as the default two-item tree does. The icon and content branches need
// no per-index content, so they keep hydrating their own defaults.
//
// `V1ElementData` is the plain-object form of a model tree: nested `elements` are objects that
// Backbone turns into models on `initialize`, and ids have to be generated here because only the
// outermost model gets one from `document/elements/create`.
const buildItemModel = ( position: number ): V1ElementData => {
	const numberedTitle = getItemTitle( position );

	return {
		elType: ACCORDION_ITEM_ELEMENT_TYPE,
		id: generateElementId(),
		editor_settings: { title: numberedTitle, initial_position: position },
		elements: [
			{
				elType: ACCORDION_ITEM_HEAD_ELEMENT_TYPE,
				id: generateElementId(),
				editor_settings: { title: __( 'Head', 'elementor' ) },
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
	const addItem = ( { accordionId, items }: { accordionId: string; items: ItemsActionPayload< AccordionItem > } ) => {
		const accordion = getContainer( accordionId );

		if ( ! accordion ) {
			throw new Error( 'Accordion container not found' );
		}

		items.forEach( ( { index } ) => {
			createElements( {
				title: __( 'Accordion', 'elementor' ),
				elements: [
					{
						container: accordion,
						model: buildItemModel( index + 1 ) as unknown as CreateElementParams[ 'model' ],
					},
				],
			} );
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
