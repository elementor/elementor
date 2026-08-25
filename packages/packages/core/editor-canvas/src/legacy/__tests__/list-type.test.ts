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
const resetListType = () => Reflect.deleteProperty( elementsLegacyTypes, LIST_TYPE );

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
		resetListType();

		jest.mocked( createNestedTemplatedElementType ).mockImplementation( () => {
			const MockBaseType = function MockBaseType() {};

			MockBaseType.prototype.getType = () => LIST_TYPE;
			MockBaseType.prototype.getView = () => function MockBaseView() {};

			return MockBaseType as never;
		} );

		jest.mocked( createNestedTemplatedElementView ).mockImplementation( () => {
			const MockBaseView = Object.assign( function BaseViewMock() {}, {
				extend() {
					return Object.assign( function ExtendedViewMock() {}, {
						viewId: ++generatedViewId,
					} );
				},
			} );

			return MockBaseView as never;
		} );
	} );

	afterEach( () => {
		resetListType();
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
