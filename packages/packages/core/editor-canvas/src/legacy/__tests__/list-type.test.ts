import {
	createNestedTemplatedElementType,
	createNestedTemplatedElementView,
} from '../create-nested-templated-element-type';
import { elementsLegacyTypes } from '../init-legacy-views';
import { initListType } from '../list-type';

jest.mock( '../create-nested-templated-element-type', () => ( {
	createNestedTemplatedElementType: jest.fn(),
	createNestedTemplatedElementView: jest.fn(),
} ) );

const LIST_TYPE = 'e-list';

const createMockOptions = () => ( {
	type: LIST_TYPE,
	renderer: {
		register: jest.fn(),
		render: jest.fn(),
	},
	element: {
		twig_templates: {},
		twig_main_template: 'main',
		atomic_props_schema: {},
		base_styles_dictionary: {},
		default_html_tag: 'ul',
		html_tag_follows_link: false,
		support_nesting: true,
	},
} );

describe( 'initListType', () => {
	beforeEach( () => {
		let generatedViewId = 0;

		jest.clearAllMocks();
		delete elementsLegacyTypes[ LIST_TYPE ];

		jest.mocked( createNestedTemplatedElementType ).mockImplementation(
			() => class MockBaseType {}
		);

		jest.mocked( createNestedTemplatedElementView ).mockImplementation( () => {
			class MockBaseView {
				static extend() {
					return class MockExtendedView {
						static viewId = ++generatedViewId;
					};
				}
			}

			return MockBaseView as never;
		} );
	} );

	afterEach( () => {
		delete elementsLegacyTypes[ LIST_TYPE ];
	} );

	it( 'should reuse the same view class for multiple list type instances', () => {
		// Arrange
		initListType();
		const createListType = elementsLegacyTypes[ LIST_TYPE ];
		const ElementType = createListType( createMockOptions() );

		// Act
		const typeInstance1 = new ElementType();
		const typeInstance2 = new ElementType();
		const viewClass1 = typeInstance1.getView();
		const viewClass2 = typeInstance2.getView();

		// Assert
		expect( viewClass1 ).toBe( viewClass2 );
		expect( createNestedTemplatedElementView ).toHaveBeenCalledTimes( 1 );
	} );
} );
