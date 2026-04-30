import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { MinMaxDateTimeControl } from '../min-max-date-time-control';

const propType = createMockPropType( {
	kind: 'object',
	key: 'min-max-date-time',
	shape: {
		min: createMockPropType( { kind: 'plain', key: 'string' } ),
		max: createMockPropType( { kind: 'plain', key: 'string' } ),
	},
} );

const createValue = ( min: string | null, max: string | null ) => ( {
	$$type: 'min-max-date-time',
	value: {
		min: min === null ? null : { $$type: 'string', value: min },
		max: max === null ? null : { $$type: 'string', value: max },
	},
} );

describe( 'MinMaxDateTimeControl', () => {
	describe( 'date variant', () => {
		it( 'should render Min date and Max date labels', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( null, null ),
				bind: 'date_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl />, props );

			// Assert.
			expect( screen.getByText( 'Min date' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Max date' ) ).toBeInTheDocument();
		} );

		it( 'should render existing min and max date values', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '2026-04-01', '2026-04-30' ),
				bind: 'date_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl />, props );

			// Assert.
			expect( ( screen.getByLabelText( 'Min date' ) as HTMLInputElement ).value ).toBe( '04/01/2026' );
			expect( ( screen.getByLabelText( 'Max date' ) as HTMLInputElement ).value ).toBe( '04/30/2026' );
		} );

		it( 'should not show range error for valid range', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '2026-04-01', '2026-04-30' ),
				bind: 'date_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl />, props );

			// Assert.
			expect( screen.queryByText( 'Max date must be on or after Min date' ) ).not.toBeInTheDocument();
			expect( screen.getByLabelText( 'Min date' ) ).toHaveAttribute( 'aria-invalid', 'false' );
			expect( screen.getByLabelText( 'Max date' ) ).toHaveAttribute( 'aria-invalid', 'false' );
		} );

		it( 'should show range error and mark inputs invalid when max is before min', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '2026-04-30', '2026-04-01' ),
				bind: 'date_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl />, props );

			// Assert.
			expect( screen.getByText( 'Max date must be on or after Min date' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'Min date' ) ).toHaveAttribute( 'aria-invalid', 'true' );
			expect( screen.getByLabelText( 'Max date' ) ).toHaveAttribute( 'aria-invalid', 'true' );
		} );

		it( 'should not show range error when only one bound is set', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '2026-04-30', null ),
				bind: 'date_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl />, props );

			// Assert.
			expect( screen.queryByText( 'Max date must be on or after Min date' ) ).not.toBeInTheDocument();
		} );

		it( 'should call setValue with merged min when min input changes', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: createValue( '2026-04-01', '2026-04-30' ),
				bind: 'date_range',
				propType,
			};

			renderControl( <MinMaxDateTimeControl />, props );

			// Act.
			fireEvent.change( screen.getByLabelText( 'Min date' ), { target: { value: '04/15/2026' } } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'min-max-date-time',
				value: {
					min: { $$type: 'string', value: '2026-04-15' },
					max: { $$type: 'string', value: '2026-04-30' },
				},
			} );
		} );

		it( 'should call setValue with merged max when max input changes', () => {
			// Arrange.
			const setValue = jest.fn();
			const props = {
				setValue,
				value: createValue( '2026-04-01', '2026-04-30' ),
				bind: 'date_range',
				propType,
			};

			renderControl( <MinMaxDateTimeControl />, props );

			// Act.
			fireEvent.change( screen.getByLabelText( 'Max date' ), { target: { value: '05/15/2026' } } );

			// Assert.
			expect( setValue ).toHaveBeenCalledWith( {
				$$type: 'min-max-date-time',
				value: {
					min: { $$type: 'string', value: '2026-04-01' },
					max: { $$type: 'string', value: '2026-05-15' },
				},
			} );
		} );
	} );

	describe( 'time variant', () => {
		it( 'should render Start time and End time labels', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( null, null ),
				bind: 'time_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl variant="time" />, props );

			// Assert.
			expect( screen.getByText( 'Start time' ) ).toBeInTheDocument();
			expect( screen.getByText( 'End time' ) ).toBeInTheDocument();
		} );

		it( 'should render existing start and end time values', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '09:00', '17:30' ),
				bind: 'time_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl variant="time" />, props );

			// Assert.
			expect( ( screen.getByLabelText( 'Start time' ) as HTMLInputElement ).value ).toBe( '09:00 AM' );
			expect( ( screen.getByLabelText( 'End time' ) as HTMLInputElement ).value ).toBe( '05:30 PM' );
		} );

		it( 'should not show range error for time variant even when max is lexicographically before min', () => {
			// Arrange.
			const props = {
				setValue: jest.fn(),
				value: createValue( '17:00', '09:00' ),
				bind: 'time_range',
				propType,
			};

			// Act.
			renderControl( <MinMaxDateTimeControl variant="time" />, props );

			// Assert.
			expect( screen.queryByText( 'Max date must be on or after Min date' ) ).not.toBeInTheDocument();
			expect( screen.getByLabelText( 'Start time' ) ).toHaveAttribute( 'aria-invalid', 'false' );
			expect( screen.getByLabelText( 'End time' ) ).toHaveAttribute( 'aria-invalid', 'false' );
		} );
	} );
} );
