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

	describe( 'endDragElementFromPanel', () => {
		it( 'should trigger element:drag:end event', () => {
			// Act
			endDragElementFromPanel();

			// Assert
			expect( mockTrigger ).toHaveBeenCalledWith( 'element:drag:end' );
		} );
	} );
} );
