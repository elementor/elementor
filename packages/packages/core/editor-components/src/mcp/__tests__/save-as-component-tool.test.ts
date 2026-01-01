import {
	getContainer,
	getElementType,
	getWidgetsCache,
	type V1Element,
	type V1ElementData,
} from '@elementor/editor-elements';
import { AxiosError } from '@elementor/http-client';

import { apiClient } from '../../api';
import { createUnpublishedComponent } from '../../store/actions/create-unpublished-component';
import { ERROR_MESSAGES, handleSaveAsComponent } from '../save-as-component-tool';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-mcp', () => ( {
	getMCPByDomain: () => ( { addTool: jest.fn( ( config ) => config ) } ),
	toolPrompts: () => ( {
		description: jest.fn().mockReturnThis(),
	} ),
} ) );
jest.mock( '../../store/actions/create-unpublished-component' );
jest.mock( '../../api' );

const mockGetContainer = jest.mocked( getContainer );
const mockGetElementType = jest.mocked( getElementType );
const mockGetWidgetsCache = jest.mocked( getWidgetsCache );
const mockCreateUnpublishedComponent = jest.mocked( createUnpublishedComponent );
const mockApiClient = jest.mocked( apiClient );

type MockContainer = Pick< V1Element, 'id' | 'model' >;

const TEST_ELEMENT_ID = 'test-element-123';
const TEST_CHILD_ELEMENT_ID = 'child-element-456';
const TEST_COMPONENT_NAME = 'My Test Component';
const TEST_COMPONENT_UID = 'component-1234567890-abc123';
const VALID_ELEMENT_TYPES = [ 'e-div-block', 'e-flexbox', 'e-tabs' ];

describe( 'save-as-component-tool handler', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		mockApiClient.validate = jest.fn().mockResolvedValue( { valid: true } );

		mockGetWidgetsCache.mockReturnValue( {
			'e-div-block': {
				propsSchema: {},
				atomic_props_schema: true,
				show_in_panel: true,
				elType: 'container',
			},
			'e-flexbox': {
				propsSchema: {},
				atomic_props_schema: true,
				show_in_panel: true,
				elType: 'container',
			},
			'e-tabs': {
				propsSchema: {},
				atomic_props_schema: true,
				show_in_panel: true,
				elType: 'container',
			},
		} as unknown as ReturnType< typeof getWidgetsCache > );
	} );

	describe( 'Success Cases', () => {
		it.each( VALID_ELEMENT_TYPES )(
			'should create component successfully for element type: %s',
			async ( elType ) => {
				// Arrange
				mockGetContainer.mockReturnValue( createMockContainer( elType ) as V1Element );
				mockCreateUnpublishedComponent.mockReturnValue( TEST_COMPONENT_UID );

				// Act
				const result = await handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
				} );

				// Assert
				expect( result ).toEqual( {
					status: 'ok',
					message: `Component "${ TEST_COMPONENT_NAME }" created successfully.`,
					component_uid: expect.stringContaining( 'component-' ),
				} );

				expect( mockApiClient.validate ).toHaveBeenCalledWith(
					expect.objectContaining( {
						items: expect.arrayContaining( [
							expect.objectContaining( {
								title: TEST_COMPONENT_NAME,
								elements: expect.arrayContaining( [ expect.objectContaining( { elType } ) ] ),
							} ),
						] ),
					} )
				);

				expect( mockCreateUnpublishedComponent ).toHaveBeenCalledWith(
					TEST_COMPONENT_NAME,
					expect.objectContaining( { elType } ),
					null,
					undefined,
					expect.any( String )
				);
			}
		);

		it( 'should create component with overridable_props successfully', async () => {
			// Arrange
			const mockElementType = {
				propsSchema: {
					text: { type: 'string', default: 'Default Text' },
					tag: { type: 'string', default: 'h2' },
				},
			};

			mockGetContainer.mockReturnValue(
				createMockContainerWithChildren( 'e-flexbox', [
					{ id: TEST_CHILD_ELEMENT_ID, elType: 'widget', widgetType: 'e-heading', settings: {} },
				] ) as V1Element
			);
			mockGetElementType.mockReturnValue( mockElementType as unknown as ReturnType< typeof getElementType > );
			mockCreateUnpublishedComponent.mockReturnValue( TEST_COMPONENT_UID );

			// Act
			const result = await handleSaveAsComponent( {
				element_id: TEST_ELEMENT_ID,
				component_name: TEST_COMPONENT_NAME,
				overridable_props: {
					props: {
						heading_text: {
							elementId: TEST_CHILD_ELEMENT_ID,
							propKey: 'text',
							label: 'Heading Text',
						},
					},
				},
			} );

			// Assert
			expect( result ).toEqual( {
				status: 'ok',
				message: `Component "${ TEST_COMPONENT_NAME }" created successfully.`,
				component_uid: expect.stringContaining( 'component-' ),
			} );

			expect( mockApiClient.validate ).toHaveBeenCalledWith(
				expect.objectContaining( {
					items: expect.arrayContaining( [
						expect.objectContaining( {
							title: TEST_COMPONENT_NAME,
							settings: expect.objectContaining( {
								overridable_props: expect.objectContaining( {
									props: expect.any( Object ),
									groups: expect.any( Object ),
								} ),
							} ),
						} ),
					] ),
				} )
			);

			expect( mockCreateUnpublishedComponent ).toHaveBeenCalledWith(
				TEST_COMPONENT_NAME,
				expect.objectContaining( { elType: 'e-flexbox' } ),
				null,
				expect.objectContaining( {
					props: expect.any( Object ),
					groups: expect.any( Object ),
				} ),
				expect.any( String )
			);
		} );
	} );

	describe( 'Error Cases', () => {
		it( 'should throw error when element is not found', async () => {
			// Arrange
			mockGetContainer.mockReturnValue( null );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: 'non-existent-id',
					component_name: TEST_COMPONENT_NAME,
				} )
			).rejects.toThrow( ERROR_MESSAGES.ELEMENT_NOT_FOUND );
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when element type is not valid', async () => {
			// Arrange
			const invalidElType = 'e-button';
			mockGetContainer.mockReturnValue( createMockContainer( invalidElType ) as V1Element );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
				} )
			).rejects.toThrow( ERROR_MESSAGES.ELEMENT_NOT_ONE_OF_TYPES( VALID_ELEMENT_TYPES ) );
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when element is locked', async () => {
			// Arrange
			mockGetContainer.mockReturnValue( createMockContainer( 'e-flexbox', { isLocked: true } ) as V1Element );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
				} )
			).rejects.toThrow( ERROR_MESSAGES.ELEMENT_IS_LOCKED );
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when validation fails with duplicate title', async () => {
			// Arrange
			mockGetContainer.mockReturnValue( createMockContainer( 'e-flexbox' ) as V1Element );
			const duplicateTitleError = new AxiosError( 'Request failed' );
			( duplicateTitleError as never as { response: { data: { messge: string } } } ).response = {
				data: { messge: "Validation failed: Component title 'My Test Component' is duplicated." },
			};
			mockApiClient.validate = jest.fn().mockRejectedValue( duplicateTitleError );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
				} )
			).rejects.toThrow( "Validation failed: Component title 'My Test Component' is duplicated." );
			expect( mockApiClient.validate ).toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when validation fails with invalid overridable_props', async () => {
			// Arrange
			const mockElementType = {
				propsSchema: {
					text: { type: 'string', default: 'Default Text' },
				},
			};

			mockGetContainer.mockReturnValue(
				createMockContainerWithChildren( 'e-flexbox', [
					{ id: TEST_CHILD_ELEMENT_ID, elType: 'widget', widgetType: 'e-heading', settings: {} },
				] ) as V1Element
			);
			mockGetElementType.mockReturnValue( mockElementType as unknown as ReturnType< typeof getElementType > );
			const invalidOverridablePropsError = new AxiosError( 'Request failed' );
			( invalidOverridablePropsError as never as { response: { data: { messge: string } } } ).response = {
				data: { messge: 'Validation failed for overridable_props: Invalid prop structure' },
			};
			mockApiClient.validate = jest.fn().mockRejectedValue( invalidOverridablePropsError );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
					overridable_props: {
						props: {
							heading_text: {
								elementId: TEST_CHILD_ELEMENT_ID,
								propKey: 'text',
								label: 'Heading Text',
							},
						},
					},
				} )
			).rejects.toThrow( 'Validation failed for overridable_props: Invalid prop structure' );
			expect( mockApiClient.validate ).toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when child element is not found for overridable_props', async () => {
			// Arrange
			mockGetContainer.mockReturnValue( createMockContainer( 'e-flexbox' ) as V1Element );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
					overridable_props: {
						props: {
							heading_text: {
								elementId: 'non-existent-child-id',
								propKey: 'text',
								label: 'Heading Text',
							},
						},
					},
				} )
			).rejects.toThrow( 'Element with ID "non-existent-child-id" not found in component' );
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when propKey does not exist in element schema', async () => {
			// Arrange
			const mockElementType = {
				propsSchema: {
					text: { type: 'string', default: 'Default Text' },
				},
			};

			mockGetContainer.mockReturnValue(
				createMockContainerWithChildren( 'e-flexbox', [
					{ id: TEST_CHILD_ELEMENT_ID, elType: 'widget', widgetType: 'e-heading', settings: {} },
				] ) as V1Element
			);
			mockGetElementType.mockReturnValue( mockElementType as unknown as ReturnType< typeof getElementType > );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
					overridable_props: {
						props: {
							heading_invalid: {
								elementId: TEST_CHILD_ELEMENT_ID,
								propKey: 'nonExistentProp',
								label: 'Invalid Prop',
							},
						},
					},
				} )
			).rejects.toThrow(
				`Property "nonExistentProp" does not exist in element "${ TEST_CHILD_ELEMENT_ID }" (type: e-heading). Available properties: text`
			);
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );

		it( 'should throw error when element type does not have propsSchema', async () => {
			// Arrange
			mockGetContainer.mockReturnValue(
				createMockContainerWithChildren( 'e-flexbox', [
					{ id: TEST_CHILD_ELEMENT_ID, elType: 'widget', widgetType: 'e-heading', settings: {} },
				] ) as V1Element
			);
			mockGetElementType.mockReturnValue( null );

			// Act & Assert
			await expect(
				handleSaveAsComponent( {
					element_id: TEST_ELEMENT_ID,
					component_name: TEST_COMPONENT_NAME,
					overridable_props: {
						props: {
							heading_text: {
								elementId: TEST_CHILD_ELEMENT_ID,
								propKey: 'text',
								label: 'Heading Text',
							},
						},
					},
				} )
			).rejects.toThrow(
				'Element type "e-heading" is not atomic or does not have a settings schema. Cannot expose property "text" for element'
			);
			expect( mockApiClient.validate ).not.toHaveBeenCalled();
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );
	} );
} );

function createMockContainer( elType: string, elementOverrides: Record< string, unknown > = {} ): MockContainer {
	const elementData: V1ElementData = {
		id: TEST_ELEMENT_ID,
		elType,
		settings: {},
		elements: [],
		...elementOverrides,
	};

	return {
		id: TEST_ELEMENT_ID,
		model: {
			get: ( key: string ) => {
				if ( key === 'elType' ) {
					return elType;
				}
				return elementData[ key as keyof typeof elementData ];
			},
			set: jest.fn(),
			toJSON: () => elementData,
		},
	} as MockContainer;
}

function createMockContainerWithChildren(
	elType: string,
	children: Array< Partial< V1ElementData > > = [],
	elementOverrides: Record< string, unknown > = {}
): MockContainer {
	const elementData: V1ElementData = {
		id: TEST_ELEMENT_ID,
		elType,
		settings: {},
		elements: children as V1ElementData[],
		...elementOverrides,
	};

	return {
		id: TEST_ELEMENT_ID,
		model: {
			get: ( key: string ) => {
				if ( key === 'elType' ) {
					return elType;
				}
				return elementData[ key as keyof typeof elementData ];
			},
			set: jest.fn(),
			toJSON: () => elementData,
		},
	} as MockContainer;
}
