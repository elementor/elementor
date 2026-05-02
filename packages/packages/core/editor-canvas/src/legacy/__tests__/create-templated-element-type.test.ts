import { mockLegacyElementor } from 'test-utils';

import {
	canBeTemplated,
	createTemplatedElementType,
	createTemplatedElementView,
} from '../create-templated-element-type';

const MOCK_ELEMENT_TYPE = 'test-element';
const MOCK_HTML = '<div>Element</div>';

const createMockRenderer = () => ( {
	register: jest.fn(),
	render: jest.fn( () => Promise.resolve( MOCK_HTML ) ),
} );

const createMockElementConfig = () => ( {
	twig_templates: {},
	twig_main_template: 'main',
	atomic_props_schema: {},
	base_styles_dictionary: {},
} );

describe( 'createTemplatedElementType', () => {
	beforeEach( () => {
		mockLegacyElementor();
	} );

	it( 'should return the correct element type', () => {
		// Arrange
		const ElementType = createTemplatedElementType( {
			type: MOCK_ELEMENT_TYPE,
			renderer: createMockRenderer(),
			element: createMockElementConfig(),
		} );

		// Act
		const typeInstance = new ElementType();

		// Assert
		expect( typeInstance.getType() ).toBe( MOCK_ELEMENT_TYPE );
	} );

	it( 'should return the same view class for multiple type instances', () => {
		// Arrange
		const ElementType = createTemplatedElementType( {
			type: MOCK_ELEMENT_TYPE,
			renderer: createMockRenderer(),
			element: createMockElementConfig(),
		} );

		// Act
		const typeInstance1 = new ElementType();
		const typeInstance2 = new ElementType();
		const viewClass1 = typeInstance1.getView();
		const viewClass2 = typeInstance2.getView();

		// Assert
		expect( viewClass1 ).toBe( viewClass2 );
	} );
} );

describe( 'createTemplatedElementView', () => {
	beforeEach( () => {
		mockLegacyElementor();
	} );

	describe( 'class structure', () => {
		it( 'should return twig as template type', () => {
			// Arrange
			const ViewClass = createTemplatedElementView( {
				type: MOCK_ELEMENT_TYPE,
				renderer: createMockRenderer(),
				element: createMockElementConfig(),
			} );

			// Assert
			expect( ViewClass.prototype.getTemplateType() ).toBe( 'twig' );
		} );

		it( 'should return element type as namespace key', () => {
			// Arrange
			const ViewClass = createTemplatedElementView( {
				type: MOCK_ELEMENT_TYPE,
				renderer: createMockRenderer(),
				element: createMockElementConfig(),
			} );

			// Assert
			expect( ViewClass.prototype.getNamespaceKey() ).toBe( MOCK_ELEMENT_TYPE );
		} );
	} );

	describe( 'template registration', () => {
		it( 'should register templates with the renderer', () => {
			// Arrange
			const utils = createMockRenderer();
			const elementConfig = {
				...createMockElementConfig(),
				twig_templates: {
					template1: '<div>Template 1</div>',
					template2: '<div>Template 2</div>',
				},
			};

			// Act
			createTemplatedElementView( {
				type: MOCK_ELEMENT_TYPE,
				renderer: utils,
				element: elementConfig,
			} );

			// Assert
			expect( utils.register ).toHaveBeenCalledTimes( 2 );
			expect( utils.register ).toHaveBeenCalledWith( 'template1', '<div>Template 1</div>' );
			expect( utils.register ).toHaveBeenCalledWith( 'template2', '<div>Template 2</div>' );
		} );
	} );
} );

describe( 'canBeTemplated', () => {
	it( 'should return true when all required properties are present', () => {
		// Arrange
		const element = createMockElementConfig();

		// Act
		const result = canBeTemplated( element );

		// Assert
		expect( result ).toBe( true );
	} );

	it( 'should return false when atomic_props_schema is missing', () => {
		// Arrange
		const element = {
			twig_templates: {},
			twig_main_template: 'main',
			base_styles_dictionary: {},
		};

		// Act
		const result = canBeTemplated( element );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when twig_templates is missing', () => {
		// Arrange
		const element = {
			twig_main_template: 'main',
			atomic_props_schema: {},
			base_styles_dictionary: {},
		};

		// Act
		const result = canBeTemplated( element );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when twig_main_template is missing', () => {
		// Arrange
		const element = {
			twig_templates: {},
			atomic_props_schema: {},
			base_styles_dictionary: {},
		};

		// Act
		const result = canBeTemplated( element );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should return false when base_styles_dictionary is missing', () => {
		// Arrange
		const element = {
			twig_templates: {},
			twig_main_template: 'main',
			atomic_props_schema: {},
		};

		// Act
		const result = canBeTemplated( element );

		// Assert
		expect( result ).toBe( false );
	} );
} );
