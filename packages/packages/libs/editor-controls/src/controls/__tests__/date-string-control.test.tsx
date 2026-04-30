import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { DateStringControl } from '../date-string-control';

const propType = createMockPropType( { kind: 'plain' } );

describe( 'DateStringControl', () => {
	describe( 'date variant', () => {
		it( 'should render the formatted date value in the input', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '2026-04-30' },
				bind: 'date',
				propType,
			};

			// Act.
			renderControl( <DateStringControl ariaLabel="Min date" />, props );

			// Assert.
			const input = screen.getByLabelText( 'Min date' ) as HTMLInputElement;
			expect( input.value ).toBe( '04/30/2026' );
		} );

		it( 'should call setValue with formatted date when input changes', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '' },
				bind: 'date',
				propType,
			};

			renderControl( <DateStringControl ariaLabel="Min date" />, props );

			const input = screen.getByLabelText( 'Min date' );

			// Act.
			fireEvent.change( input, { target: { value: '04/30/2026' } } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: '2026-04-30',
			} );
		} );

		it( 'should call setValue with null when the input is cleared', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '2026-04-30' },
				bind: 'date',
				propType,
			};

			renderControl( <DateStringControl ariaLabel="Min date" />, props );

			const input = screen.getByLabelText( 'Min date' );

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
				value: { $$type: 'string', value: null },
				bind: 'date',
				propType,
			};

			// Act.
			renderControl( <DateStringControl ariaLabel="Min date" />, props );

			// Assert.
			const input = screen.getByLabelText( 'Min date' ) as HTMLInputElement;
			expect( input.value ).toBe( '' );
		} );

		it( 'should disable the input when inputDisabled is true', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '2026-04-30' },
				bind: 'date',
				propType,
			};

			// Act.
			renderControl( <DateStringControl ariaLabel="Min date" inputDisabled />, props );

			// Assert.
			expect( screen.getByLabelText( 'Min date' ) ).toBeDisabled();
		} );

		it( 'should mark the input as invalid when error is true', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '2026-04-30' },
				bind: 'date',
				propType,
			};

			// Act.
			renderControl( <DateStringControl ariaLabel="Min date" error />, props );

			// Assert.
			expect( screen.getByLabelText( 'Min date' ) ).toHaveAttribute( 'aria-invalid', 'true' );
		} );
	} );

	describe( 'time variant', () => {
		it( 'should render the formatted time value in the input', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '09:30' },
				bind: 'time',
				propType,
			};

			// Act.
			renderControl( <DateStringControl variant="time" ariaLabel="Start time" />, props );

			// Assert.
			const input = screen.getByLabelText( 'Start time' ) as HTMLInputElement;
			expect( input.value ).toBe( '09:30 AM' );
		} );

		it( 'should call setValue with formatted time when input changes', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: '' },
				bind: 'time',
				propType,
			};

			renderControl( <DateStringControl variant="time" ariaLabel="Start time" />, props );

			const input = screen.getByLabelText( 'Start time' );

			// Act.
			fireEvent.change( input, { target: { value: '02:15 PM' } } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'string',
				value: '14:15',
			} );
		} );

		it( 'should render an empty input when the time value is malformed', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: { $$type: 'string', value: 'not-a-time' },
				bind: 'time',
				propType,
			};

			// Act.
			renderControl( <DateStringControl variant="time" ariaLabel="Start time" />, props );

			// Assert.
			const input = screen.getByLabelText( 'Start time' ) as HTMLInputElement;
			expect( input.value ).toBe( '' );
		} );
	} );
} );
