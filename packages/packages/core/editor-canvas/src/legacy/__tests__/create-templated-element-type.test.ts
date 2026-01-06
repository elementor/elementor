import { mockLegacyElementor } from 'test-utils';

import { createTemplatedElementType } from '../create-templated-element-type';

const MOCK_ELEMENT_TYPE = 'test-element';

const createMockRenderer = () => ( {
	register: jest.fn(),
	render: jest.fn( () => Promise.resolve( '<div>Element</div>' ) ),
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
