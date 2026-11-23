/* eslint-disable @typescript-eslint/no-explicit-any */
import { type StyleDefinition } from '@elementor/editor-styles';
import { httpService } from '@elementor/http-client';
import { __getState as getState } from '@elementor/store';

import { defaultStylesStylesProvider } from '../../default-styles-provider';
import { selectData, selectInitialData } from '../../store';
import { initManageDefaultStylesTool } from '../manage-default-styles-tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => ( {
	__getState: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	selectData: jest.fn(),
	selectInitialData: jest.fn(),
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

const mockEditorStyle = (
	current: Record< string, StyleDefinition >,
	initial: Record< string, StyleDefinition > = current
) => {
	( selectData as jest.Mock ).mockReturnValue( current );
	( selectInitialData as jest.Mock ).mockReturnValue( initial );
};

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
		( getState as jest.Mock ).mockReturnValue( {} );
		mockEditorStyle( {} );
		( selectInitialData as jest.Mock ).mockReturnValue( {} );
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
				editor_default_styles: {},
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

	it( 'sends the current editor variants and applies sequential updates on the same tag', async () => {
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
		mockEditorStyle( {
			h1: {
				id: 'h1',
				label: 'h1',
				type: 'class',
				variants: firstVariants,
			},
		} );
		const result = await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'color: #ffffff;',
		} );

		// Assert.
		const secondInput = httpMock.post.mock.calls[ 1 ][ 1 ].input;
		expect( secondInput.operations ).toEqual( [ { action: 'update', tag: 'h1', css: 'color: #ffffff;' } ] );
		expect( secondInput.editor_default_styles ).toEqual( {
			h1: {
				type: 'class',
				variants: firstVariants,
			},
		} );
		expect( defaultStylesStylesProvider.actions.update ).toHaveBeenLastCalledWith( {
			id: 'h1',
			label: 'h1',
			type: 'class',
			variants: secondVariants,
		} );
		expect( result ).toEqual( { status: 'ok', tag: 'h1' } );
	} );

	it( 'plans from unsaved manual panel edits on the same tag', async () => {
		// Arrange.
		const manualVariants = [
			{
				meta: { breakpoint: 'desktop', state: null },
				props: { color: { $$type: 'color', value: 'blue' } },
			},
		];
		const plannedVariants = [
			{
				meta: { breakpoint: 'desktop', state: null },
				props: {
					color: { $$type: 'color', value: 'blue' },
					'font-size': { $$type: 'size', value: '24px' },
				},
			},
		];
		mockEditorStyle( {
			h1: {
				id: 'h1',
				label: 'h1',
				type: 'class',
				variants: manualVariants,
			},
		} );
		httpMock.post.mockResolvedValue(
			mockProxyResults( [
				{
					status: 'ok',
					action: 'update',
					tag: 'h1',
					type: 'class',
					variants: plannedVariants,
				},
			] )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'font-size: 24px;',
		} );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-default-styles',
			input: {
				operations: [ { action: 'update', tag: 'h1', css: 'font-size: 24px;' } ],
				dry_run: true,
				editor_default_styles: {
					h1: {
						type: 'class',
						variants: manualVariants,
					},
				},
			},
		} );
		expect( defaultStylesStylesProvider.actions.update ).toHaveBeenCalledWith( {
			id: 'h1',
			label: 'h1',
			type: 'class',
			variants: plannedVariants,
		} );
	} );

	it( 'sends an empty override when the tag was deleted in the editor and does not resurrect saved variants', async () => {
		// Arrange.
		const savedVariants = [
			{
				meta: { breakpoint: 'desktop', state: null },
				props: { color: { $$type: 'color', value: 'blue' } },
			},
		];
		const plannedVariants = [
			{
				meta: { breakpoint: 'desktop', state: null },
				props: { 'font-size': { $$type: 'size', value: '24px' } },
			},
		];
		mockEditorStyle(
			{},
			{
				h1: {
					id: 'h1',
					label: 'h1',
					type: 'class',
					variants: savedVariants,
				},
			}
		);
		httpMock.post.mockResolvedValue(
			mockProxyResults( [
				{
					status: 'ok',
					action: 'update',
					tag: 'h1',
					type: 'class',
					variants: plannedVariants,
				},
			] )
		);
		const { registeredTool } = createMockRegistry();

		// Act.
		await registeredTool.handler( {
			action: 'update',
			tag: 'h1',
			css: 'font-size: 24px;',
		} );

		// Assert.
		expect( httpMock.post ).toHaveBeenCalledWith( MCP_PROXY_URL, {
			tool: 'manage-default-styles',
			input: {
				operations: [ { action: 'update', tag: 'h1', css: 'font-size: 24px;' } ],
				dry_run: true,
				editor_default_styles: {
					h1: {
						type: 'class',
						variants: [],
					},
				},
			},
		} );
		expect( defaultStylesStylesProvider.actions.update ).toHaveBeenCalledWith( {
			id: 'h1',
			label: 'h1',
			type: 'class',
			variants: plannedVariants,
		} );
		expect( plannedVariants[ 0 ].props ).not.toHaveProperty( 'color' );
	} );
} );
