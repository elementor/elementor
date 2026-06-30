import { createMockStyleDefinition } from 'test-utils';
import { stylesRepository, validateStyleLabel } from '@elementor/editor-styles-repository';

jest.mock( '../../styles-repository' );

describe( 'validateStyleLabel', () => {
	beforeEach( () => {
		jest.mocked( stylesRepository.all ).mockReturnValue( [
			createMockStyleDefinition( { id: '1', label: 'class-1' } ),
			createMockStyleDefinition( { id: '2', label: 'class-2' } ),
		] );
	} );

	it( 'should pass validation if label is valid', () => {
		// Act.
		const result = validateStyleLabel( 'valid-label', 'create' );

		// Assert.
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );

	it.each( [
		{
			reason: 'label is too long',
			label: 'super-long-class-label-with-more-than-50-characters',
			message: 'Class name is too long. Please keep it under 50 characters.',
		},
		{ reason: 'label starts with a number', label: '1invalid', message: 'Class names must start with a letter.' },
		{
			reason: 'label contains spaces',
			label: 'invalid label',
			message: 'Class names can’t contain spaces.',
		},
		{
			reason: 'label contains special characters',
			label: 'invalid@label',
			message: 'Class names can only use letters, numbers, dashes (-), and underscores (_).',
		},
		{
			reason: 'label starts with double hyphens',
			label: '--invalid',
			message: 'Double hyphens are reserved for custom properties.',
		},
		{
			reason: 'label starts with a hyphen followed by a number',
			label: '-1invalid',
			message: 'Class names can’t start with a hyphen followed by a number.',
		},
		{
			reason: 'label is a reserved name',
			label: 'container',
			message: 'This name is reserved and can’t be used. Try something more specific.',
		},
	] )( 'should fail validation if $reason', ( { label, message } ) => {
		// Act.
		const result = validateStyleLabel( label, 'inputChange' );

		// Assert.
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( message );
	} );

	it.each( [
		{ label: '', event: 'create', labelDescription: 'empty' },
		{ label: '', event: 'rename', labelDescription: 'empty' },

		{ label: 'a', event: 'create', labelDescription: 'single-character' },
		{ label: 'a', event: 'rename', labelDescription: 'single-character' },
	] )( 'should fail validation for a "$labelDescription" label when event is "$event"', ( { label, event } ) => {
		// Act.
		const result = validateStyleLabel( label, event as 'create' | 'rename' );

		// Assert.
		expect( result.isValid ).toBe( false );
		expect( result.errorMessage ).toBe( 'Class name is too short. Use at least 2 characters.' );
	} );

	it.each( [
		{ label: '', labelDescription: 'empty' },
		{ label: 'a', labelDescription: 'single-character' },
	] )( 'should fail validation for a "$labelDescription" label when event is "inputChange"', ( { label } ) => {
		// Act.
		const result = validateStyleLabel( label, 'inputChange' );

		// Assert.
		expect( result.isValid ).toBe( true );
		expect( result.errorMessage ).toBeNull();
	} );
} );
