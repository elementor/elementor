import { renderHook, waitFor } from '@testing-library/react';
import PropTypes from 'prop-types';
import { ExportContextProvider } from 'elementor/app/modules/import-export-customization/assets/js/export/context/export-context';
import { useKitValidation } from 'elementor/app/modules/import-export-customization/assets/js/export/hooks/use-kit-validation';

const createWrapper = () => {
	const Wrapper = ( { children } ) => (
		<ExportContextProvider>
			{ children }
		</ExportContextProvider>
	);

	Wrapper.propTypes = {
		children: PropTypes.node.isRequired,
	};

	return Wrapper;
};

describe( 'useKitValidation Hook', () => {
	describe( 'Initial State', () => {
		it( 'should initialize with correct default values', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.templateName ).toBe( '' );
			expect( result.current.description ).toBe( '' );
			expect( result.current.hasDescriptionError ).toBe( false );
			expect( result.current.descriptionCounterColor ).toBe( 'text.secondary' );
			expect( result.current.DESCRIPTION_MAX_LENGTH ).toBe( 300 );
			expect( typeof result.current.handleNameChange ).toBe( 'function' );
			expect( typeof result.current.handleDescriptionChange ).toBe( 'function' );
			expect( typeof result.current.validateKitName ).toBe( 'function' );
			expect( typeof result.current.validateDescription ).toBe( 'function' );

			// Name should have validation error since it starts empty
			await waitFor( () => {
				expect( result.current.nameError ).toBe( 'Must add a website template name' );
			} );
		} );
	} );

	describe( 'Name Validation', () => {
		it( 'should validate empty name as invalid', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			expect( validateKitName( '' ) ).toBe( 'Must add a website template name' );
			expect( validateKitName( null ) ).toBe( 'Must add a website template name' );
			expect( validateKitName( undefined ) ).toBe( 'Must add a website template name' );
		} );

		it( 'should validate whitespace-only name as invalid', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			expect( validateKitName( '   ' ) ).toBe( 'Must add a website template name' );
			expect( validateKitName( '\t\n' ) ).toBe( 'Must add a website template name' );
			expect( validateKitName( '    \r\n   ' ) ).toBe( 'Must add a website template name' );
		} );

		it( 'should reject special characters', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			expect( validateKitName( 'Kit<Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit>Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit:Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit"Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit/Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit\\Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit|Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit?Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit*Name' ) ).toBe( 'Use characters only' );

			expect( validateKitName( 'Kit<>Name' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit"Name"|Test' ) ).toBe( 'Use characters only' );

			expect( validateKitName( '<KitName' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'KitName>' ) ).toBe( 'Use characters only' );
			expect( validateKitName( 'Kit<Na>me' ) ).toBe( 'Use characters only' );
		} );

		it( 'should accept valid characters', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			expect( validateKitName( 'My Kit' ) ).toBeNull();
			expect( validateKitName( 'Kit Name' ) ).toBeNull();
			expect( validateKitName( 'Simple Kit' ) ).toBeNull();

			expect( validateKitName( 'Kit 123' ) ).toBeNull();
			expect( validateKitName( '2023 Kit' ) ).toBeNull();
			expect( validateKitName( 'Kit2023' ) ).toBeNull();

			expect( validateKitName( 'Kit-Name' ) ).toBeNull();
			expect( validateKitName( 'Kit_Name' ) ).toBeNull();
			expect( validateKitName( 'Kit.Name' ) ).toBeNull();
			expect( validateKitName( 'Kit(Name)' ) ).toBeNull();

			expect( validateKitName( 'My-Kit_2023.v1' ) ).toBeNull();
			expect( validateKitName( 'Corporate Kit (Version 2)' ) ).toBeNull();
			expect( validateKitName( 'Kit_Name-123.final' ) ).toBeNull();
		} );

		it( 'should handle edge cases', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateKitName = result.current.validateKitName;

			expect( validateKitName( 'A' ) ).toBeNull();
			expect( validateKitName( '1' ) ).toBeNull();

			const longValidName = 'A'.repeat( 75 );
			expect( validateKitName( longValidName ) ).toBeNull();

			expect( validateKitName( 'MyKitName' ) ).toBeNull();
			expect( validateKitName( 'KITNAME' ) ).toBeNull();
			expect( validateKitName( 'kitname' ) ).toBeNull();
		} );
	} );

	describe( 'Description Validation', () => {
		it( 'should validate description length correctly', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateDescription = result.current.validateDescription;
			const DESCRIPTION_MAX_LENGTH = result.current.DESCRIPTION_MAX_LENGTH;

			expect( validateDescription( '' ) ).toBeNull();

			expect( validateDescription( 'Short description' ) ).toBeNull();

			const exactLengthDescription = 'a'.repeat( DESCRIPTION_MAX_LENGTH );
			expect( validateDescription( exactLengthDescription ) ).toBeNull();

			const tooLongDescription = 'a'.repeat( DESCRIPTION_MAX_LENGTH + 1 );
			expect( validateDescription( tooLongDescription ) ).toBe( 'Description exceeds 300 characters' );

			const muchTooLongDescription = 'a'.repeat( DESCRIPTION_MAX_LENGTH + 100 );
			expect( validateDescription( muchTooLongDescription ) ).toBe( 'Description exceeds 300 characters' );
		} );

		it( 'should handle special characters in description', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validateDescription = result.current.validateDescription;

			expect( validateDescription( 'Description with <special> characters' ) ).toBeNull();
			expect( validateDescription( 'Description with "quotes" and | pipes' ) ).toBeNull();
			expect( validateDescription( 'Description with ? and * wildcards' ) ).toBeNull();
		} );
	} );

	describe( 'Computed Properties', () => {
		it( 'should compute hasDescriptionError correctly', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.hasDescriptionError ).toBe( false );

			const mockEvent = {
				target: { value: 'a'.repeat( 301 ) },
			};

			await waitFor( () => {
				result.current.handleDescriptionChange( mockEvent );
			} );

			expect( result.current.hasDescriptionError ).toBe( false );
		} );

		it( 'should compute descriptionCounterColor correctly', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.descriptionCounterColor ).toBe( 'text.secondary' );

			// Should change to error when hasDescriptionError is true
		} );
	} );

	describe( 'Change Handlers', () => {
		it( 'should handle name changes correctly', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const mockEvent = {
				target: { value: 'New Kit Name' },
			};

			await waitFor( () => {
				result.current.handleNameChange( mockEvent );
			} );

			await waitFor( () => {
				expect( result.current.templateName ).toBe( 'New Kit Name' );
			} );
		} );

		it( 'should handle empty name changes', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const mockEvent = {
				target: { value: '' },
			};

			await waitFor( () => {
				result.current.handleNameChange( mockEvent );
			} );

			await waitFor( () => {
				expect( result.current.templateName ).toBe( '' );
			} );
		} );

		it( 'should handle description changes within limit', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const validDescription = 'This is a valid description';
			const mockEvent = {
				target: { value: validDescription },
			};

			await waitFor( () => {
				result.current.handleDescriptionChange( mockEvent );
			} );

			await waitFor( () => {
				expect( result.current.description ).toBe( validDescription );
			} );
		} );

		it( 'should prevent description changes exceeding limit', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const tooLongDescription = 'a'.repeat( 301 );
			const mockEvent = {
				target: { value: tooLongDescription },
			};

			const initialDescription = result.current.description;

			await waitFor( () => {
				result.current.handleDescriptionChange( mockEvent );
			} );

			expect( result.current.description ).toBe( initialDescription );
		} );

		it( 'should handle description at exact limit', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const exactLimitDescription = 'a'.repeat( 300 );
			const mockEvent = {
				target: { value: exactLimitDescription },
			};

			await waitFor( () => {
				result.current.handleDescriptionChange( mockEvent );
			} );

			await waitFor( () => {
				expect( result.current.description ).toBe( exactLimitDescription );
			} );
		} );

		it( 'should handle null/undefined event values', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			const mockEventNull = {
				target: { value: null },
			};

			await waitFor( () => {
				result.current.handleNameChange( mockEventNull );
			} );

			await waitFor( () => {
				expect( result.current.templateName ).toBe( '' );
			} );

			const mockEventUndefined = {
				target: { value: undefined },
			};

			await waitFor( () => {
				result.current.handleDescriptionChange( mockEventUndefined );
			} );

			await waitFor( () => {
				expect( result.current.description ).toBe( '' );
			} );
		} );
	} );

	describe( 'Integration with Export Context', () => {
		it( 'should update validation errors in context', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				expect( result.current.nameError ).toBe( 'Must add a website template name' );
			} );

			const validNameEvent = {
				target: { value: 'Valid Kit Name' },
			};

			await waitFor( () => {
				result.current.handleNameChange( validNameEvent );
			} );

			await waitFor( () => {
				expect( result.current.nameError ).toBeNull();
			} );
		} );

		it( 'should validate on initial render with existing data', async () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			await waitFor( () => {
				expect( result.current.nameError ).toBe( 'Must add a website template name' ); // Empty name is invalid
			} );
		} );
	} );

	describe( 'Constants', () => {
		it( 'should expose correct constants', () => {
			const { result } = renderHook( () => useKitValidation(), {
				wrapper: createWrapper(),
			} );

			expect( result.current.DESCRIPTION_MAX_LENGTH ).toBe( 300 );
			expect( typeof result.current.DESCRIPTION_MAX_LENGTH ).toBe( 'number' );
		} );
	} );
} );
