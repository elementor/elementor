import { createMockElement, createMockElementWithOverridable } from 'test-utils';
import { getContainer, updateElementSettings } from '@elementor/editor-elements';

import { componentOverridablePropTypeUtil } from '../../prop-types/component-overridable-prop-type';
import {
	cleanOverridablePropsForContainers,
	cleanOverridablePropsFromElementData,
	cleanOverridablePropsFromSettings,
} from '../clean-overridable-props';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getContainer: jest.fn(),
	updateElementSettings: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockUpdateElementSettings = jest.mocked( updateElementSettings );

describe( 'cleanOverridablePropsFromSettings', () => {
	it( 'should return cleaned props when settings contain overridable props', () => {
		// Arrange
		const settings = {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-123',
				origin_value: { $$type: 'html', value: 'Hello World' },
			} ),
			regularProp: { $$type: 'string', value: 'Regular value' },
		};

		// Act
		const result = cleanOverridablePropsFromSettings( settings );

		// Assert
		expect( result ).toEqual( {
			title: { $$type: 'html', value: 'Hello World' },
		} );
	} );

	it( 'should return null when no overridable props exist', () => {
		// Arrange
		const settings = {
			title: { $$type: 'html', value: 'Hello World' },
			description: { $$type: 'string', value: 'Some description' },
		};

		// Act
		const result = cleanOverridablePropsFromSettings( settings );

		// Assert
		expect( result ).toBeNull();
	} );

	it( 'should handle multiple overridable props', () => {
		// Arrange
		const settings = {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-1',
				origin_value: { $$type: 'html', value: 'Title' },
			} ),
			subtitle: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-2',
				origin_value: { $$type: 'string', value: 'Subtitle' },
			} ),
		};

		// Act
		const result = cleanOverridablePropsFromSettings( settings );

		// Assert
		expect( result ).toEqual( {
			title: { $$type: 'html', value: 'Title' },
			subtitle: { $$type: 'string', value: 'Subtitle' },
		} );
	} );

	it( 'should handle null origin_value', () => {
		// Arrange
		const settings = {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-123',
				origin_value: null,
			} ),
		};

		// Act
		const result = cleanOverridablePropsFromSettings( settings );

		// Assert
		expect( result ).toEqual( {
			title: null,
		} );
	} );
} );

describe( 'cleanOverridablePropsFromElementData', () => {
	it( 'should clean overridable props from element settings', () => {
		// Arrange
		const element = {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
			},
		};

		// Act
		const result = cleanOverridablePropsFromElementData( element );

		// Assert
		expect( result.settings?.title ).toEqual( { $$type: 'html', value: 'Hello' } );
	} );

	it( 'should recursively clean nested elements', () => {
		// Arrange
		const element = {
			id: 'container-1',
			elType: 'e-con',
			settings: {
				containerProp: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-1',
					origin_value: { $$type: 'string', value: 'Container Value' },
				} ),
			},
			elements: [
				{
					id: 'widget-1',
					elType: 'widget',
					widgetType: 'e-heading',
					settings: {
						title: componentOverridablePropTypeUtil.create( {
							override_key: 'prop-2',
							origin_value: { $$type: 'html', value: 'Nested Title' },
						} ),
					},
				},
			],
		};

		// Act
		const result = cleanOverridablePropsFromElementData( element );

		// Assert
		expect( result.settings?.containerProp ).toEqual( { $$type: 'string', value: 'Container Value' } );
		expect( result.elements?.[ 0 ].settings?.title ).toEqual( { $$type: 'html', value: 'Nested Title' } );
	} );

	it( 'should preserve non-overridable props', () => {
		// Arrange
		const element = {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'e-heading',
			settings: {
				title: componentOverridablePropTypeUtil.create( {
					override_key: 'prop-123',
					origin_value: { $$type: 'html', value: 'Hello' },
				} ),
				regularProp: { $$type: 'string', value: 'Unchanged' },
			},
		};

		// Act
		const result = cleanOverridablePropsFromElementData( element );

		// Assert
		expect( result.settings?.title ).toEqual( { $$type: 'html', value: 'Hello' } );
		expect( result.settings?.regularProp ).toEqual( { $$type: 'string', value: 'Unchanged' } );
	} );

	it( 'should return element unchanged when no overridable props exist', () => {
		// Arrange
		const element = {
			id: 'element-1',
			elType: 'widget',
			widgetType: 'e-heading',
			settings: {
				title: { $$type: 'html', value: 'Hello' },
			},
		};

		// Act
		const result = cleanOverridablePropsFromElementData( element );

		// Assert
		expect( result.settings?.title ).toEqual( { $$type: 'html', value: 'Hello' } );
	} );
} );

describe( 'cleanOverridablePropsForContainers', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should clean overridable props from element and update settings', () => {
		// Arrange
		const element = createMockElementWithOverridable( 'element-1', {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-123',
				origin_value: { $$type: 'html', value: 'Hello' },
			} ),
		} );

		mockGetContainer.mockReturnValue( element );

		// Act
		cleanOverridablePropsForContainers( element );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 1 );
		expect( mockUpdateElementSettings ).toHaveBeenCalledWith( {
			id: 'element-1',
			props: {
				title: { $$type: 'html', value: 'Hello' },
			},
			withHistory: false,
		} );
	} );

	it( 'should not update settings when no overridable props exist', () => {
		// Arrange
		const element = createMockElement( {
			model: {
				id: 'element-1',
				widgetType: 'e-heading',
				elType: 'widget',
			},
			settings: {
				title: { $$type: 'html', value: 'Hello World' },
			},
		} );

		mockGetContainer.mockReturnValue( element );

		// Act
		cleanOverridablePropsForContainers( element );

		// Assert
		expect( mockUpdateElementSettings ).not.toHaveBeenCalled();
	} );

	it( 'should handle array of containers', () => {
		// Arrange
		const element1 = createMockElementWithOverridable( 'element-1', {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-1',
				origin_value: { $$type: 'html', value: 'Title 1' },
			} ),
		} );

		const element2 = createMockElementWithOverridable( 'element-2', {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'prop-2',
				origin_value: { $$type: 'html', value: 'Title 2' },
			} ),
		} );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return element1;
			}
			if ( id === 'element-2' ) {
				return element2;
			}
			return null;
		} );

		// Act
		cleanOverridablePropsForContainers( [ element1, element2 ] );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should process nested elements recursively', () => {
		// Arrange
		const childElement = createMockElementWithOverridable( 'child-element', {
			title: componentOverridablePropTypeUtil.create( {
				override_key: 'child-prop',
				origin_value: { $$type: 'html', value: 'Child Title' },
			} ),
		} );

		const parentElement = createMockElementWithOverridable( 'parent-element', {
			containerProp: componentOverridablePropTypeUtil.create( {
				override_key: 'parent-prop',
				origin_value: { $$type: 'string', value: 'Parent Value' },
			} ),
		} );

		parentElement.children = [ childElement ];

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'parent-element' ) {
				return parentElement;
			}
			if ( id === 'child-element' ) {
				return childElement;
			}
			return null;
		} );

		// Act
		cleanOverridablePropsForContainers( parentElement );

		// Assert
		expect( mockUpdateElementSettings ).toHaveBeenCalledTimes( 2 );
		expect( mockUpdateElementSettings ).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining( { id: 'parent-element' } )
		);
		expect( mockUpdateElementSettings ).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining( { id: 'child-element' } )
		);
	} );
} );

