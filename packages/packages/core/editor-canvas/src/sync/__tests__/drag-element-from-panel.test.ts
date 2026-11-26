import { endDragElementFromPanel, startDragElementFromPanel } from '../drag-element-from-panel';
import { type CanvasExtendedWindow } from '../types';

const EXPECTED_DRAG_GROUPS = [ 'elementor-element' ];

const mockTrigger = jest.fn();
const mockReply = jest.fn( () => ( { trigger: mockTrigger } ) );

describe( 'drag-element-from-panel', () => {
	const extendedWindow = window as unknown as CanvasExtendedWindow;

	extendedWindow.elementor = {
		channels: {
			editor: { reply: mockReply },
			panelElements: { reply: mockReply, trigger: mockTrigger },
		} as unknown as never,
		modules: {
			elements: {
				models: {
					Element: jest.fn( ( props ) => props ),
				},
			},
		},
	};

	describe( 'startDragElementFromPanel', () => {
		it( 'should set dataTransfer with drag groups', () => {
			// Arrange
			const mockSetData = jest.fn();
			const mockEvent = {
				dataTransfer: {
					setData: mockSetData,
					getData: () => '',
				},
			} as unknown as React.DragEvent;

			// Act
			startDragElementFromPanel( { elType: 'widget', widgetType: 'test' }, mockEvent );

			// Assert
			expect( mockSetData ).toHaveBeenCalledWith( JSON.stringify( { groups: EXPECTED_DRAG_GROUPS } ), 'true' );
		} );

		it( 'should trigger panel element events', () => {
			// Arrange
			const mockEvent = {
				dataTransfer: { setData: jest.fn(), getData: () => '' },
			} as unknown as React.DragEvent;

			// Act
			startDragElementFromPanel( { elType: 'widget', widgetType: 'test' }, mockEvent );

			// Assert
			expect( mockReply ).toHaveBeenCalledWith( 'element:dragged', null );
			expect( mockReply ).toHaveBeenCalledWith( 'element:selected', expect.any( Object ) );
			expect( mockTrigger ).toHaveBeenCalledWith( 'element:drag:start' );
		} );
	} );

	describe( 'startDragElementFromPanel custom', () => {
		const Element = extendedWindow.elementor?.modules?.elements?.models?.Element as jest.Mock;
		const mockEvent = { dataTransfer: { setData: jest.fn(), getData: () => '' } } as unknown as React.DragEvent;

		it( 'should merge the custom argument into the preset metadata', () => {
			// Act
			startDragElementFromPanel( { elType: 'widget', widgetType: 'test', settings: { a: 1 } }, mockEvent, {
				group: 'x',
			} );

			// Assert
			expect( Element ).toHaveBeenLastCalledWith(
				expect.objectContaining( { custom: { isPreset: true, preset_settings: { a: 1 }, group: 'x' } } )
			);
		} );

		it( 'should keep the default custom data when no custom argument is passed', () => {
			// Act
			startDragElementFromPanel( { elType: 'widget', widgetType: 'test' }, mockEvent );

			// Assert
			expect( Element ).toHaveBeenLastCalledWith(
				expect.objectContaining( { custom: { isPreset: false, preset_settings: undefined } } )
			);
		} );
	} );

	describe( 'endDragElementFromPanel', () => {
		it( 'should trigger element:drag:end event', () => {
			// Act
			endDragElementFromPanel();

			// Assert
			expect( mockTrigger ).toHaveBeenCalledWith( 'element:drag:end' );
		} );
	} );
} );
