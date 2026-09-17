import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { TimeStringControl } from '../time-string-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'TimeStringControl', () => {
	it( 'should render the formatted time value in the input', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: '14:30' },
			bind: 'time',
			propType,
		};

		// Act.
		renderControl( <TimeStringControl ariaLabel="Min time" />, props );

		// Assert.
		const input = screen.getByLabelText( 'Min time' ) as HTMLInputElement;
		expect( input.value ).toBe( '02:30 PM' );
	} );

	it( 'should call setValue with formatted time when input changes', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: '' },
			bind: 'time',
			propType,
		};

		renderControl( <TimeStringControl ariaLabel="Min time" />, props );

		const input = screen.getByLabelText( 'Min time' );

		// Act.
		fireEvent.change( input, { target: { value: '02:30 PM' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'time-string',
			value: '14:30',
		} );
	} );

	it( 'should call setValue with null when the input is cleared', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: '14:30' },
			bind: 'time',
			propType,
		};

		renderControl( <TimeStringControl ariaLabel="Min time" />, props );

		const input = screen.getByLabelText( 'Min time' );

		// Act.
		fireEvent.change( input, { target: { value: '' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( null );
	} );

	it( 'should render an empty input when the value is null', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: null },
			bind: 'time',
			propType,
		};

		// Act.
		renderControl( <TimeStringControl ariaLabel="Min time" />, props );

		// Assert.
		const input = screen.getByLabelText( 'Min time' ) as HTMLInputElement;
		expect( input.value ).toBe( '' );
	} );

	it( 'should disable the input when inputDisabled is true', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: '14:30' },
			bind: 'time',
			propType,
		};

		// Act.
		renderControl( <TimeStringControl ariaLabel="Min time" inputDisabled />, props );

		// Assert.
		expect( screen.getByLabelText( 'Min time' ) ).toBeDisabled();
	} );

	it( 'should mark the input as invalid when error is true', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: { $$type: 'time-string', value: '14:30' },
			bind: 'time',
			propType,
		};

		// Act.
		renderControl( <TimeStringControl ariaLabel="Min time" error />, props );

		// Assert.
		expect( screen.getByLabelText( 'Min time' ) ).toHaveAttribute( 'aria-invalid', 'true' );
	} );
} );
