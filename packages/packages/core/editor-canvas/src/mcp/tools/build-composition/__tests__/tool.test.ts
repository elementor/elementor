import { getCurrentDocument } from '@elementor/editor-documents';
import { createElements, getContainer, getCurrentDocumentContainer, removeElements } from '@elementor/editor-elements';
import { httpService } from '@elementor/http-client';

import { initBuildCompositionTool } from '../tool';

jest.mock( '@elementor/http-client', () => ( {
	httpService: jest.fn(),
	AxiosError: class AxiosError extends Error {},
} ) );

jest.mock( '@elementor/editor-documents', () => ( {
	getCurrentDocument: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	createElements: jest.fn(),
	getContainer: jest.fn(),
	getCurrentDocumentContainer: jest.fn(),
	removeElements: jest.fn(),
} ) );

type ToolConfig = {
	handler: ( input: Record< string, unknown > ) => Promise< Record< string, unknown > >;
};

const POST_ID = 12;
const CURRENT_TREE = [ { id: 'unsaved1', elType: 'e-div-block', elements: [] } ];
const PLANNED_ELEMENT = {
	id: 'a1b2c3',
	elType: 'e-div-block',
	settings: {},
	elements: [ { id: 'd4e5f6', elType: 'widget', widgetType: 'e-heading', settings: {}, elements: [] } ],
};

const documentContainer = {
	id: 'document',
	model: {
		get: () => ( { toJSON: () => CURRENT_TREE } ),
	},
};

const captureTool = (): ToolConfig => {
	const addTool = jest.fn();
	initBuildCompositionTool( { addTool, resource: jest.fn() } as never );

	return addTool.mock.calls[ 0 ][ 0 ] as ToolConfig;
};

const givenServerPlan = ( plan: Record< string, unknown > ) => {
	const post = jest.fn().mockResolvedValue( { data: { data: plan } } );
	jest.mocked( httpService ).mockReturnValue( { post } as never );

	return post;
};

describe( 'build-composition tool', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getCurrentDocument ).mockReturnValue( { id: POST_ID } as never );
		jest.mocked( getCurrentDocumentContainer ).mockReturnValue( documentContainer as never );
	} );

	it( 'plans in dry run against the live editor tree and inserts the planned elements locally', async () => {
		// Arrange.
		const post = givenServerPlan( {
			root_element_ids: [ 'a1b2c3' ],
			resolved_xml: '<e-div-block id="a1b2c3"></e-div-block>',
			elements: [ PLANNED_ELEMENT ],
		} );

		// Act.
		const result = await captureTool().handler( { xml_structure: '<e-div-block configuration-id="hero"/>' } );

		// Assert.
		expect( post ).toHaveBeenCalledWith( 'elementor/v1/mcp-proxy', {
			tool: 'build-composition',
			input: {
				xml_structure: '<e-div-block configuration-id="hero"/>',
				post_id: POST_ID,
				parent_id: 'document',
				mode: 'append',
				dry_run: true,
				document_elements: CURRENT_TREE,
			},
		} );
		expect( createElements ).toHaveBeenCalledWith( {
			title: 'Build composition',
			elements: [ { container: documentContainer, model: PLANNED_ELEMENT } ],
		} );
		expect( removeElements ).not.toHaveBeenCalled();
		expect( result ).toEqual( {
			root_element_ids: [ 'a1b2c3' ],
			resolved_xml: '<e-div-block id="a1b2c3"></e-div-block>',
		} );
	} );

	it( 'removes the replaced children before inserting under the parent', async () => {
		// Arrange.
		const parentContainer = { id: 'parent1' };
		jest.mocked( getContainer ).mockReturnValue( parentContainer as never );
		givenServerPlan( {
			root_element_ids: [ 'a1b2c3' ],
			removed_element_ids: [ 'old1', 'old2' ],
			elements: [ PLANNED_ELEMENT ],
		} );

		// Act.
		await captureTool().handler( {
			xml_structure: '<e-div-block configuration-id="hero"/>',
			parent_id: 'parent1',
			mode: 'replace_children',
		} );

		// Assert.
		expect( removeElements ).toHaveBeenCalledWith( {
			elementIds: [ 'old1', 'old2' ],
			title: 'Build composition',
		} );
		expect( createElements ).toHaveBeenCalledWith( {
			title: 'Build composition',
			elements: [ { container: parentContainer, model: PLANNED_ELEMENT } ],
		} );
	} );

	it( 'fails without calling the server when the parent is not in the editor', async () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( null );
		const post = givenServerPlan( {} );

		// Act & Assert.
		await expect(
			captureTool().handler( { xml_structure: '<e-div-block configuration-id="hero"/>', parent_id: 'missing' } )
		).rejects.toThrow( 'Parent element not found: missing' );
		expect( post ).not.toHaveBeenCalled();
	} );

	it( 'changes nothing in the editor when the server rejects the composition', async () => {
		// Arrange.
		const post = jest.fn().mockRejectedValue( new Error( 'invalid_xml' ) );
		jest.mocked( httpService ).mockReturnValue( { post } as never );

		// Act & Assert.
		await expect( captureTool().handler( { xml_structure: '<broken' } ) ).rejects.toThrow( 'invalid_xml' );
		expect( createElements ).not.toHaveBeenCalled();
		expect( removeElements ).not.toHaveBeenCalled();
	} );
} );
