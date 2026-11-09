import { getMCPByDomain } from '@elementor/editor-mcp';

import { resetConsoleErrorsMonitorForTests, startConsoleErrorsMonitor } from '../console-errors-monitor';
import { initConsoleMcp } from '../console-mcp';
import { initReadConsoleErrorsTool } from '../tools/read-console-errors/tool';

const mockAddTool = jest.fn();

jest.mock( '@elementor/editor-mcp', () => ( {
	...jest.requireActual( '@elementor/editor-mcp' ),
	getMCPByDomain: jest.fn( () => ( { addTool: mockAddTool } ) ),
} ) );

type ToolHandler = ( args: { since?: number; limit?: number } ) => unknown;

const getHandler = (): ToolHandler => {
	initReadConsoleErrorsTool( getMCPByDomain( 'console' ) );

	return mockAddTool.mock.calls[ 0 ][ 0 ].handler;
};

const dispatchError = ( message: string ) => {
	const error = new Error( message );
	window.dispatchEvent( new ErrorEvent( 'error', { message, error } ) );
};

describe( 'read-console-errors tool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		resetConsoleErrorsMonitorForTests();
		delete window.elementorEditorAngie;
		Object.defineProperty( performance, 'getEntriesByType', { configurable: true, value: () => [] } );
	} );

	it( 'returns recent console errors with their stack traces', () => {
		// Arrange
		startConsoleErrorsMonitor();
		const handler = getHandler();
		dispatchError( 'Boom' );

		// Act
		const result = handler( { limit: 10 } );

		// Assert
		expect( result ).toEqual( {
			success: true,
			found: 1,
			message: 'Found 1 error(s). Review the issues below.',
			errors: [
				{
					timestamp: expect.any( Number ),
					level: 'error',
					message: 'Boom',
					stack: expect.stringContaining( 'Boom' ),
				},
			],
		} );
	} );

	it( 'reports no errors when the console is clean', () => {
		// Arrange
		startConsoleErrorsMonitor();
		const handler = getHandler();

		// Act
		const result = handler( {} );

		// Assert
		expect( result ).toEqual(
			expect.objectContaining( { found: 0, message: 'No console errors found.', errors: [] } )
		);
	} );

	it( 'returns only the latest errors up to the limit', () => {
		// Arrange
		startConsoleErrorsMonitor();
		const handler = getHandler();
		dispatchError( 'first' );
		dispatchError( 'second' );

		// Act
		const result = handler( { limit: 1 } ) as { errors: Array< { message: string } > };

		// Assert
		expect( result.errors.map( ( { message } ) => message ) ).toEqual( [ 'second' ] );
	} );

	it( 'fails when the monitor was not started', () => {
		// Arrange
		const handler = getHandler();

		// Act & Assert
		expect( () => handler( {} ) ).toThrow( 'Console errors monitor not initialized' );
	} );

	it( 'registers the tool on the console MCP server', () => {
		// Act
		initConsoleMcp();

		// Assert
		expect( getMCPByDomain ).toHaveBeenCalledWith( 'console', expect.any( Object ) );
		expect( mockAddTool ).toHaveBeenCalledWith( expect.objectContaining( { name: 'read-console-errors' } ) );
	} );

	it( 'skips registration when the Angie plugin already provides the tool', () => {
		// Arrange
		window.elementorEditorAngie = { isAngiePluginActive: true };

		// Act
		initConsoleMcp();

		// Assert
		expect( mockAddTool ).not.toHaveBeenCalled();
	} );
} );
