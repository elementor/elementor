import { toolPrompts } from '@elementor/editor-mcp';

import { initCanvasMcp } from '../canvas-mcp';
import { isIconLibraryActive } from '../icon-library-experiment';
import { generatePrompt } from '../tools/configure-element/prompt';
import { initFindIconsTool } from '../tools/find-icons/tool';

jest.mock( '@elementor/editor-mcp', () => ( {
	toolPrompts: jest.fn(),
} ) );

jest.mock( '@elementor/editor-props', () => ( {
	Schema: { setDynamicTagNamesResolver: jest.fn() },
} ) );

jest.mock( '../icon-library-experiment', () => ( {
	isIconLibraryActive: jest.fn(),
} ) );

jest.mock( '../tools/find-icons/tool', () => ( { initFindIconsTool: jest.fn() } ) );
jest.mock( '../tools/configure-element/tool', () => ( { initConfigureElementTool: jest.fn() } ) );
jest.mock( '../tools/get-page-structure/tool', () => ( { initGetPageStructureTool: jest.fn() } ) );
jest.mock( '../utils/resolve-dynamic-tag', () => ( { getDynamicTagNamesByCategories: jest.fn() } ) );
jest.mock( '../resources/available-widgets-resource', () => ( { initAvailableWidgetsResource: jest.fn() } ) );
jest.mock( '../resources/best-practices-resource', () => ( { initBestPracticesResource: jest.fn() } ) );
jest.mock( '../resources/breakpoints-resource', () => ( { initBreakpointsResource: jest.fn() } ) );
jest.mock( '../resources/document-structure-resource', () => ( { initDocumentStructureResource: jest.fn() } ) );
jest.mock( '../resources/dynamic-tags-resource', () => ( {
	DYNAMIC_TAGS_URI: 'elementor://dynamic-tags',
	initDynamicTagsResource: jest.fn(),
} ) );
jest.mock( '../resources/editor-state-resource', () => ( { initEditorStateResource: jest.fn() } ) );
jest.mock( '../resources/general-context-resource', () => ( { initGeneralContextResource: jest.fn() } ) );
jest.mock( '../resources/selected-element-resource', () => ( { initSelectedElementResource: jest.fn() } ) );
jest.mock( '../resources/widgets-schema-resource', () => ( {
	WIDGET_SCHEMA_URI: 'elementor://widgets/schema/{widgetType}',
	initWidgetsSchemaResource: jest.fn(),
} ) );

const mockedIsIconLibraryActive = jest.mocked( isIconLibraryActive );

describe( 'icon library experiment gating', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'find-icons registration', () => {
		it( 'should register the find-icons tool when the experiment is active', () => {
			// Arrange.
			mockedIsIconLibraryActive.mockReturnValue( true );

			// Act.
			initCanvasMcp( {} as never );

			// Assert.
			expect( initFindIconsTool ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not register the find-icons tool when the experiment is inactive', () => {
			// Arrange.
			mockedIsIconLibraryActive.mockReturnValue( false );

			// Act.
			initCanvasMcp( {} as never );

			// Assert.
			expect( initFindIconsTool ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'configure-element prompt', () => {
		const buildPrompt = () => {
			const description = jest.fn();
			const example = jest.fn();
			const prompt = { description, example, parameter: jest.fn(), instruction: jest.fn(), prompt: jest.fn() };

			jest.mocked( toolPrompts ).mockReturnValue( prompt as never );

			generatePrompt();

			return { description: description.mock.calls[ 0 ][ 0 ] as string, example };
		};

		it( 'should advertise find-icons guidance when the experiment is active', () => {
			// Arrange.
			mockedIsIconLibraryActive.mockReturnValue( true );

			// Act.
			const { description, example } = buildPrompt();

			// Assert.
			expect( description ).toContain( 'find-icons' );
			expect( example ).toHaveBeenCalledWith( expect.stringContaining( 'find-icons' ) );
		} );

		it( 'should not mention find-icons when the experiment is inactive', () => {
			// Arrange.
			mockedIsIconLibraryActive.mockReturnValue( false );

			// Act.
			const { description, example } = buildPrompt();

			// Assert.
			expect( description ).not.toContain( 'find-icons' );
			expect( example ).not.toHaveBeenCalledWith( expect.stringContaining( 'find-icons' ) );
		} );
	} );
} );
