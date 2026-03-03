import { ERROR_MESSAGES, validateGroupLabel } from '../utils/validate-group-label';

describe( 'validateGroupLabel', () => {
	const EXISTING_GROUPS = {
		'group-1': { id: 'group-1', label: 'Content', props: [] },
		'group-2': { id: 'group-2', label: 'Style', props: [] },
	};

	it( 'should return empty string for valid unique label', () => {
		// Arrange
		const label = 'New Group';

		// Act
		const result = validateGroupLabel( label, EXISTING_GROUPS );

		// Assert
		expect( result ).toBe( '' );
	} );

	it( 'should return error for empty label', () => {
		// Arrange
		const label = '';

		// Act
		const result = validateGroupLabel( label, EXISTING_GROUPS );

		// Assert
		expect( result ).toBe( ERROR_MESSAGES.EMPTY_NAME );
	} );

	it( 'should return error for whitespace-only label', () => {
		// Arrange
		const label = '   ';

		// Act
		const result = validateGroupLabel( label, EXISTING_GROUPS );

		// Assert
		expect( result ).toBe( ERROR_MESSAGES.EMPTY_NAME );
	} );

	it( 'should return error for duplicate label', () => {
		// Arrange
		const label = 'Content';

		// Act
		const result = validateGroupLabel( label, EXISTING_GROUPS );

		// Assert
		expect( result ).toBe( ERROR_MESSAGES.DUPLICATE_NAME );
	} );

	it( 'should be case-sensitive for duplicate check', () => {
		// Arrange
		const label = 'content';

		// Act
		const result = validateGroupLabel( label, EXISTING_GROUPS );

		// Assert
		expect( result ).toBe( '' );
	} );

	it( 'should handle empty existing groups', () => {
		// Arrange
		const label = 'New Group';

		// Act
		const result = validateGroupLabel( label, {} );

		// Assert
		expect( result ).toBe( '' );
	} );
} );
