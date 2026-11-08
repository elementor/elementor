import { handleCreateWidgetEvent } from '../init';

const mockCanCreateWidget = jest.fn();
const mockTrackEvent = jest.fn();
const mockSendPromptToAngie = jest.fn();

jest.mock( '@elementor/editor-mcp', () => {
	const { toolPrompts } = jest.requireActual( '@elementor/editor-mcp' ) as { toolPrompts: unknown };
	return {
		toolPrompts,
		canCreateWidget: () => mockCanCreateWidget(),
		sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
	};
} );

jest.mock( '@elementor/events', () => ( {
	trackEvent: ( ...args: unknown[] ) => mockTrackEvent( ...args ),
} ) );

function dispatchCreateWidgetEvent( detail: { prompt?: string; entry_point: string } ) {
	handleCreateWidgetEvent( new CustomEvent( 'elementor/editor/create-widget', { detail } ) );
}

describe( 'handleCreateWidgetEvent', () => {
	beforeEach( () => {
		mockCanCreateWidget.mockReset();
		mockTrackEvent.mockReset();
		mockSendPromptToAngie.mockReset();
	} );

	it( 'does nothing when canCreateWidget is false', () => {
		mockCanCreateWidget.mockReturnValue( false );

		dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'search_widget' } );

		expect( mockTrackEvent ).not.toHaveBeenCalled();
		expect( mockSendPromptToAngie ).not.toHaveBeenCalled();
	} );

	it( 'sends the prompt to Angie when canCreateWidget is true', () => {
		mockCanCreateWidget.mockReturnValue( true );

		dispatchCreateWidgetEvent( { prompt: 'My prompt', entry_point: 'widgets_panel' } );

		expect( mockSendPromptToAngie ).toHaveBeenCalledWith( 'My prompt' );
	} );

	it( 'tracks ai_widget_cta_clicked when canCreateWidget is true', () => {
		mockCanCreateWidget.mockReturnValue( true );

		dispatchCreateWidgetEvent( { prompt: 'Build me a widget', entry_point: 'auto_show' } );

		expect( mockTrackEvent ).toHaveBeenCalledWith( {
			eventName: 'ai_widget_cta_clicked',
			entry_point: 'auto_show',
			has_angie_installed: true,
		} );
	} );
} );
