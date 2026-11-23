/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpService } from '@elementor/http-client';

import { defaultStylesStylesProvider } from '../../default-styles-provider';
import { initManageDefaultStylesTool } from '../manage-default-styles-tool';
import { getPendingAbilityOperations, resetPendingDefaultStylesChanges } from '../pending-default-styles-changes';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '../../default-styles-provider', () => ( {
	defaultStylesStylesProvider: {
		actions: {
			update: jest.fn(),
			delete: jest.fn(),
		},
	},
} ) );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateRunCommandSync: jest.fn(),
} ) );

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

const VARIANTS = [ { meta: { breakpoint: 'desktop', state: null }, props: {} } ];

function createMockRegistry() {
	let registeredTool: any = null;

	const reg = {
		addTool: ( tool: any ) => {
			registeredTool = tool;
		},
		resource: jest.fn(),
		setMCPDescription: jest.fn(),
		sendResourceUpdated: jest.fn(),
		waitForReady: jest.fn(),
	};

	initManageDefaultStylesTool( reg as any );

	return { registeredTool };
}

function mockProxyResults( results: Record< string, unknown >[] ) {
	return {
		data: {
			data: {
				status: 'ok',
				results: results.map( ( result, index ) => ( { index, ...result } ) ),
				dry_run: true,
			},
		},
	};
}

describe( 'manage-default-styles-tool', () => {
	let httpMock: { post: jest.Mock };

	beforeEach( () => {
		httpMock = { post: jest.fn() };
		( httpService as jest.Mock ).mockReturnValue( httpMock );
		( defaultStylesStylesProvider.actions.update as jest.Mock ).mockClear();
		( defaultStylesStylesProvider.actions.delete as jest.Mock ).mockClear();
		resetPendingDefaultStylesChanges();
	} );

	it( 'calls the proxy in dry run and applies the planned update locally', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResults( [
				{
					status: 'ok',
					action: 'update',
					tag: 'h1',
					type: 'class',
					variants: VARIANTS,
				},
			] )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		const result = await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'color: #000000;',
		} );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-default-styles',
			input: {
				operations: [ { action: 'update', tag: 'h1', css: 'color: #000000;' } ],
				dry_run: true,
			},
		} );
		expect( defaultStylesStylesProvider.actions.update ).toHaveBeenCalledWith( {
			id: 'h1',
			label: 'h1',
			type: 'class',
			variants: VARIANTS,
		} );
		expect( result ).toEqual( { status: 'ok', tag: 'h1' } );
	} );

	it( 'throws instead of skipping when the planned update is incomplete', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue( mockProxyResults( [ { status: 'ok', action: 'update', tag: 'h1' } ] ) );
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect(
			registeredTool.handler( { action: 'update', tag: 'h1', css: 'color: #ffffff;' } )
		).rejects.toThrow( 'Planned default style is incomplete in the response' );
		expect( defaultStylesStylesProvider.actions.update ).not.toHaveBeenCalled();
	} );

	it( 'deletes the planned tag locally', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue( mockProxyResults( [ { status: 'ok', action: 'delete', tag: 'h1' } ] ) );
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( { action: 'delete', tag: 'h1' } );

		// Assert.
		expect( defaultStylesStylesProvider.actions.delete ).toHaveBeenCalledWith( 'h1' );
	} );

	it( 'throws and changes nothing locally when the server rejects the operation', async () => {
		// Arrange.
		httpMock.post.mockResolvedValue(
			mockProxyResults( [
				{
					status: 'error',
					action: 'delete',
					code: 'not_found',
					message: 'Default style not found for this tag.',
				},
			] )
		);
		const { registeredTool } = createMockRegistry();

		// Act & Assert.
		await expect( registeredTool.handler( { action: 'delete', tag: 'h1' } ) ).rejects.toThrow(
			'Default style not found for this tag.'
		);
		expect( defaultStylesStylesProvider.actions.delete ).not.toHaveBeenCalled();
	} );

	it( 'sends pending operations with the next update on the same tag', async () => {
		// Arrange.
		const firstVariants = [ { meta: { breakpoint: 'desktop', state: null }, props: { color: 'black' } } ];
		const secondVariants = [ { meta: { breakpoint: 'desktop', state: null }, props: { color: 'white' } } ];
		httpMock.post
			.mockResolvedValueOnce(
				mockProxyResults( [
					{
						status: 'ok',
						action: 'update',
						tag: 'h1',
						type: 'class',
						variants: firstVariants,
					},
				] )
			)
			.mockResolvedValueOnce(
				mockProxyResults( [
					{
						status: 'ok',
						action: 'update',
						tag: 'h1',
						type: 'class',
						variants: firstVariants,
					},
					{
						status: 'ok',
						action: 'update',
						tag: 'h1',
						type: 'class',
						variants: secondVariants,
					},
				] )
			);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'color: #000000;',
		} );
		const result = await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'color: #ffffff;',
		} );

		// Assert.
		const secondInput = httpMock.post.mock.calls[ 1 ][ 1 ].input;
		expect( secondInput.operations ).toHaveLength( 2 );
		expect( secondInput.operations[ 0 ] ).toEqual(
			expect.objectContaining( { action: 'update', tag: 'h1', css: 'color: #000000;' } )
		);
		expect( defaultStylesStylesProvider.actions.update ).toHaveBeenLastCalledWith( {
			id: 'h1',
			label: 'h1',
			type: 'class',
			variants: secondVariants,
		} );
		expect( result ).toEqual( { status: 'ok', tag: 'h1' } );
		expect( getPendingAbilityOperations() ).toHaveLength( 2 );
	} );
} );
