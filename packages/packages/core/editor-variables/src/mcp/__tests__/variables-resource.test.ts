/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';

import { STORAGE_UPDATED_EVENT } from '../../storage';
import { GLOBAL_VARIABLES_URI, initVariablesResource } from '../variables-resource';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateListenTo: jest.fn(),
	commandEndEvent: jest.fn( ( name: string ) => `commandEnd:${ name }` ),
} ) );

function makeEntry() {
	let registeredHandler: any = null;
	const sendResourceUpdated = jest.fn();
	const entry = {
		addTool: jest.fn(),
		resource: ( _name: string, _uri: string, _opts: any, handler: any ) => {
			registeredHandler = handler;
		},
		setMCPDescription: jest.fn(),
		sendResourceUpdated,
		waitForReady: jest.fn(),
	};
	return { entry, sendResourceUpdated, getHandler: () => registeredHandler };
}

describe( 'variables-resource (thin proxy wrapper)', () => {
	let httpMock: { get: jest.Mock };

	beforeEach( () => {
		httpMock = {
			get: jest.fn().mockResolvedValue( {
				data: { data: { abc: { label: 'brand', value: '#000' } } },
			} ),
		};
		( httpService as jest.Mock ).mockReturnValue( httpMock );
	} );

	it( 'fetches the resource from mcp-proxy GET and forwards payload as JSON', async () => {
		const canvas = makeEntry();
		const vars = makeEntry();

		initVariablesResource( vars.entry as any, canvas.entry as any );

		const uri = new URL( GLOBAL_VARIABLES_URI );
		const result = await canvas.getHandler()( uri );

		expect( httpMock.get ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			params: { uri: uri.href },
		} );
		expect( result.contents[ 0 ].mimeType ).toBe( 'application/json' );
		const parsed = JSON.parse( result.contents[ 0 ].text );
		expect( parsed.abc.label ).toBe( 'brand' );
	} );

	it( 'notifies both registries when STORAGE_UPDATED_EVENT fires', () => {
		const canvas = makeEntry();
		const vars = makeEntry();

		initVariablesResource( vars.entry as any, canvas.entry as any );

		window.dispatchEvent( new Event( STORAGE_UPDATED_EVENT ) );

		expect( canvas.sendResourceUpdated ).toHaveBeenCalledWith( { uri: GLOBAL_VARIABLES_URI } );
		expect( vars.sendResourceUpdated ).toHaveBeenCalledWith( { uri: GLOBAL_VARIABLES_URI } );
	} );
} );
