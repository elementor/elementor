import { initCanvasMcp } from '../canvas-mcp';
import { initFindIconsTool } from '../tools/find-icons/tool';

jest.mock( '@elementor/editor-props', () => ( {
	Schema: { setDynamicTagNamesResolver: jest.fn() },
} ) );

jest.mock( '../resources/available-widgets-resource', () => ( { initAvailableWidgetsResource: jest.fn() } ) );
jest.mock( '../resources/best-practices-resource', () => ( { initBestPracticesResource: jest.fn() } ) );
jest.mock( '../resources/breakpoints-resource', () => ( { initBreakpointsResource: jest.fn() } ) );
jest.mock( '../resources/document-structure-resource', () => ( { initDocumentStructureResource: jest.fn() } ) );
jest.mock( '../resources/dynamic-tags-resource', () => ( { initDynamicTagsResource: jest.fn() } ) );
jest.mock( '../resources/editor-state-resource', () => ( { initEditorStateResource: jest.fn() } ) );
jest.mock( '../resources/general-context-resource', () => ( { initGeneralContextResource: jest.fn() } ) );
jest.mock( '../resources/selected-element-resource', () => ( { initSelectedElementResource: jest.fn() } ) );
jest.mock( '../resources/widgets-schema-resource', () => ( { initWidgetsSchemaResource: jest.fn() } ) );
jest.mock( '../tools/configure-element/tool', () => ( { initConfigureElementTool: jest.fn() } ) );
jest.mock( '../tools/find-icons/tool', () => ( { initFindIconsTool: jest.fn() } ) );
jest.mock( '../tools/get-page-structure/tool', () => ( { initGetPageStructureTool: jest.fn() } ) );
jest.mock( '../utils/resolve-dynamic-tag', () => ( { getDynamicTagNamesByCategories: jest.fn() } ) );

describe( 'initCanvasMcp', () => {
	it( 'should always register the find-icons tool', () => {
		// Arrange.
		const reg = { addTool: jest.fn() } as never;

		// Act.
		initCanvasMcp( reg );

		// Assert.
		expect( initFindIconsTool ).toHaveBeenCalledWith( reg );
	} );
} );
