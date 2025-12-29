// [Found-Testing-Reference===> NONE]
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';

import { slice } from '../../store/store';
import { validateComponentName } from '../component-name-validation';

describe( 'validateComponentName', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		createStore();
	} );

	it( 'should pass validation if name is valid', () => {
		// Act
		const result = validateComponentName( 'valid-component' );

		// Assert
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it.each( [
		{
			reason: 'name is empty',
			name: '',
			message: 'Component name is required.',
		},
		{
			reason: 'name is only whitespace',
			name: '   ',
			message: 'Component name is required.',
		},
		{
			reason: 'name is too short',
			name: 'A',
			message: 'Component name is too short. Please enter at least 2 characters.',
		},
		{
			reason: 'name is too long',
			name: 'A'.repeat( 51 ),
			message: 'Component name is too long. Please keep it under 50 characters.',
		},
	] )( 'should fail validation if $reason', ( { name, message } ) => {
		// Act
		const result = validateComponentName( name );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( message );
	} );

	it.each( [
		{ name: 'MyComponent', description: 'mixed case' },
		{ name: 'my-component', description: 'with dashes' },
		{ name: 'my_component', description: 'with underscores' },
		{ name: 'component123', description: 'with numbers' },
		{ name: 'my-component_name', description: 'with dashes and underscores' },
		{ name: 'AB', description: 'minimum length' },
		{ name: 'A'.repeat( 50 ), description: 'maximum length' },
	] )( 'should pass validation for a name $description', ( { name } ) => {
		// Act
		const result = validateComponentName( name );

		// Assert
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it( 'should fail validation if name already exists', () => {
		// Arrange
		const existingName = 'existing-component';
		dispatch( slice.actions.load( [ { name: existingName, id: 1, uid: 'uid-1' } ] ) );

		// Act
		const result = validateComponentName( existingName );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Component name already exists' );
	} );

	it( 'should check for duplicate names case-insensitively', () => {
		// Arrange
		const existingName = 'ExistingComponent';
		dispatch( slice.actions.load( [ { name: existingName.toLowerCase(), id: 1, uid: 'uid-1' } ] ) );

		// Act
		const result = validateComponentName( 'EXISTINGCOMPONENT' );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Component name already exists' );
	} );

	it( 'should convert input to lowercase for validation', () => {
		// Act
		const result = validateComponentName( 'MYCOMPONENT' );

		// Assert
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it( 'should handle multiple existing components when checking duplicates', () => {
		// Arrange
		dispatch(
			slice.actions.load( [
				{ name: 'component1', id: 1, uid: 'uid-1' },
				{ name: 'component2', id: 2, uid: 'uid-2' },
				{ name: 'component3', id: 3, uid: 'uid-3' },
			] )
		);

		// Act
		const result = validateComponentName( 'component2' );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Component name already exists' );
	} );

	it( 'should pass validation when name is unique among existing components', () => {
		// Arrange
		dispatch(
			slice.actions.load( [
				{ name: 'component1', id: 1, uid: 'uid-1' },
				{ name: 'component2', id: 2, uid: 'uid-2' },
			] )
		);

		// Act
		const result = validateComponentName( 'unique-component' );

		// Assert
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it( 'should trim whitespace from input', () => {
		// Act
		const result = validateComponentName( '  valid-component  ' );

		// Assert
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it( 'should fail validation when name contains only tabs after trim', () => {
		// Act
		const result = validateComponentName( '\t\t\t' );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Component name is required.' );
	} );

	it( 'should fail validation when name contains only newlines after trim', () => {
		// Act
		const result = validateComponentName( '\n\n\n' );

		// Assert
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Component name is required.' );
	} );
} );
