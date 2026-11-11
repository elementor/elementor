import { getCurrentDocument } from '@elementor/editor-documents';
import { createElement, deleteElement, getContainer, getCurrentDocumentContainer } from '@elementor/editor-elements';
import { undoable } from '@elementor/editor-v1-adapters';
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
	createElement: jest.fn( ( { model } ) => ( { id: model.id } ) ),
	deleteElement: jest.fn(),
	getContainer: jest.fn(),
	getCurrentDocumentContainer: jest.fn(),
} ) );

type UndoableActions = {
	do: () => unknown;
	undo: ( payload: undefined, result: unknown ) => void;
};

let lastUndoable: { actions: UndoableActions; result: unknown } | null = null;

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	undoable: jest.fn( ( actions: UndoableActions ) => () => {
		const result = actions.do();
		lastUndoable = { actions, result };

		return result;
	} ),
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
		lastUndoable = null;
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
		expect( createElement ).toHaveBeenCalledWith( {
			container: documentContainer,
			model: PLANNED_ELEMENT,
			options: { useHistory: false },
		} );
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( undoable ).toHaveBeenCalledTimes( 1 );
		expect( result ).toEqual( {
			root_element_ids: [ 'a1b2c3' ],
			resolved_xml: '<e-div-block id="a1b2c3"></e-div-block>',
		} );
	} );

	it( 'replaces the children in a single undo step', async () => {
		// Arrange.
		const parentContainer = { id: 'parent1' };
		const oldChildren: Record< string, unknown > = {
			old1: {
				id: 'old1',
				parent: parentContainer,
				model: { toJSON: () => ( { id: 'old1' } ) },
				view: { _index: 0 },
			},
			old2: {
				id: 'old2',
				parent: parentContainer,
				model: { toJSON: () => ( { id: 'old2' } ) },
				view: { _index: 1 },
			},
		};
		jest.mocked( getContainer ).mockImplementation(
			( id: string ) => ( id === 'parent1' ? parentContainer : oldChildren[ id ] ?? null ) as never
		);
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
		expect( undoable ).toHaveBeenCalledTimes( 1 );
		expect( undoable ).toHaveBeenCalledWith( expect.anything(), { title: 'Build composition' } );
		expect( deleteElement ).toHaveBeenCalledWith( { container: oldChildren.old1, options: { useHistory: false } } );
		expect( deleteElement ).toHaveBeenCalledWith( { container: oldChildren.old2, options: { useHistory: false } } );
		expect( createElement ).toHaveBeenCalledWith( {
			container: parentContainer,
			model: PLANNED_ELEMENT,
			options: { useHistory: false },
		} );
	} );

	it( 'undo removes the created elements and restores the replaced children in place', async () => {
		// Arrange.
		const parentContainer = { id: 'parent1' };
		const created = { id: 'a1b2c3' };
		const old1 = {
			id: 'old1',
			parent: parentContainer,
			model: { toJSON: () => ( { id: 'old1' } ) },
			view: { _index: 2 },
		};
		const containers: Record< string, unknown > = { parent1: parentContainer, old1 };
		jest.mocked( getContainer ).mockImplementation( ( id: string ) => ( containers[ id ] ?? null ) as never );
		givenServerPlan( {
			root_element_ids: [ 'a1b2c3' ],
			removed_element_ids: [ 'old1' ],
			elements: [ PLANNED_ELEMENT ],
		} );
		await captureTool().handler( {
			xml_structure: '<e-div-block configuration-id="hero"/>',
			parent_id: 'parent1',
			mode: 'replace_children',
		} );
		containers.a1b2c3 = created;
		jest.mocked( createElement ).mockClear();
		jest.mocked( deleteElement ).mockClear();

		// Act.
		lastUndoable?.actions.undo( undefined, lastUndoable.result );

		// Assert.
		expect( deleteElement ).toHaveBeenCalledWith( { container: created, options: { useHistory: false } } );
		expect( createElement ).toHaveBeenCalledWith( {
			container: parentContainer,
			model: { id: 'old1' },
			options: { useHistory: false, at: 2 },
		} );
	} );

	it( 'does not remove anything when the plan has no elements', async () => {
		// Arrange.
		jest.mocked( getContainer ).mockReturnValue( { id: 'parent1' } as never );
		givenServerPlan( { root_element_ids: [], removed_element_ids: [ 'old1' ] } );

		// Act & Assert.
		await expect(
			captureTool().handler( {
				xml_structure: '<e-div-block configuration-id="hero"/>',
				parent_id: 'parent1',
				mode: 'replace_children',
			} )
		).rejects.toThrow( 'The planned composition has no elements to build' );
		expect( deleteElement ).not.toHaveBeenCalled();
		expect( undoable ).not.toHaveBeenCalled();
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
		expect( createElement ).not.toHaveBeenCalled();
		expect( deleteElement ).not.toHaveBeenCalled();
	} );
} );
