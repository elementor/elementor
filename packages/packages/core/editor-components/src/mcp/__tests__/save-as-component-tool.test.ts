import { getContainer, type V1Element } from '@elementor/editor-elements';

import { createUnpublishedComponent } from '../../store/actions/create-unpublished-component';
import { ERROR_MESSAGES, handleSaveAsComponent, VALID_ELEMENT_TYPES } from '../save-as-component-tool';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-mcp', () => ( {
	getMCPByDomain: () => ( { addTool: jest.fn( ( config ) => config ) } ),
} ) );
jest.mock( '../../store/create-unpublished-component' );

const mockGetContainer = jest.mocked( getContainer );
const mockCreateUnpublishedComponent = jest.mocked( createUnpublishedComponent );

type MockContainer = Pick< V1Element, 'id' | 'model' >;

const TEST_ELEMENT_ID = 'test-element-123';
const TEST_COMPONENT_NAME = 'My Test Component';
const TEST_COMPONENT_UID = 'component-1234567890-abc123';

describe( 'save-as-component-tool handler', () => {
	beforeEach( () => {
		jest.clearAllMocks();
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
					component_uid: TEST_COMPONENT_UID,
				} );
				expect( mockCreateUnpublishedComponent ).toHaveBeenCalledWith(
					TEST_COMPONENT_NAME,
					expect.objectContaining( { elType } ),
					null
				);
			}
		);
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
			).rejects.toThrow( ERROR_MESSAGES.ELEMENT_NOT_ONE_OF_TYPES );
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
			expect( mockCreateUnpublishedComponent ).not.toHaveBeenCalled();
		} );
	} );
} );

function createMockContainer( elType: string, elementOverrides: Record< string, unknown > = {} ): MockContainer {
	const elementData = {
		id: TEST_ELEMENT_ID,
		elType,
		settings: {},
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
