import { startDragElementFromPanel } from '@elementor/editor-canvas';

import { endTileDrag, isDraggableTile, startTileDrag } from '../drag-element';
import { isPanelDragging } from '../../drag-state';

jest.mock( '@elementor/editor-canvas', () => ( {
	endDragElementFromPanel: jest.fn(),
	startDragElementFromPanel: jest.fn(),
} ) );

const tile = {
	elType: 'widget',
	widgetType: 'e-heading',
	title: 'Heading',
	settings: { title: 'x' },
	custom: { isPreset: true },
};

describe( 'drag-element', () => {
	const handlers: Record< string, () => void > = {};
	const channel = {
		on: ( event: string, callback: () => void ) => {
			handlers[ event ] = callback;
		},
		off: jest.fn(),
	};

	beforeEach( () => {
		( window as unknown as { elementor: unknown } ).elementor = {
			channels: { editor: {}, panelElements: channel },
			modules: { elements: { models: { Element: class {} } } },
			userCan: () => true,
		};
	} );

	it( 'should drag the click-insert model with its custom data', () => {
		// Arrange.
		const event = {} as React.DragEvent;

		// Act.
		startTileDrag( tile, event );

		// Assert.
		expect( startDragElementFromPanel ).toHaveBeenCalledWith(
			{ elType: 'widget', widgetType: 'e-heading', title: 'Heading' },
			event,
			tile.custom
		);
		expect( isPanelDragging() ).toBe( true );
	} );

	it( 'should reset the drag flag after the drag ends on the tile', () => {
		// Arrange.
		startTileDrag( tile, {} as React.DragEvent );

		// Act.
		endTileDrag();

		// Assert.
		expect( isPanelDragging() ).toBe( false );
	} );

	it( 'should reset the drag flag when the channel reports the drag end', () => {
		// Arrange.
		startTileDrag( tile, {} as React.DragEvent );

		// Act.
		handlers[ 'element:drag:end' ]();

		// Assert.
		expect( isPanelDragging() ).toBe( false );
	} );

	it( 'should not be draggable before the editor is ready, when locked, or when not editable', () => {
		// Act & Assert.
		expect( isDraggableTile( tile ) ).toBe( true );
		expect( isDraggableTile( { ...tile, promotionType: 'atomic-form' } ) ).toBe( false );
		expect( isDraggableTile( { ...tile, editable: false } ) ).toBe( false );

		( window as unknown as { elementor: unknown } ).elementor = {};

		expect( isDraggableTile( tile ) ).toBe( false );
	} );
} );
