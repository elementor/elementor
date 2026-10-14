import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { TimeRangeControl } from '../time-range-control';

const propType = createMockPropType( {
	kind: 'object',
	key: 'time-range',
	shape: {
		min: createMockPropType( { kind: 'plain', key: 'time-string' } ),
		max: createMockPropType( { kind: 'plain', key: 'time-string' } ),
	},
} );

const createValue = ( min: string | null, max: string | null ) => ( {
	$$type: 'time-range',
	value: {
		min: min === null ? null : { $$type: 'time-string', value: min },
		max: max === null ? null : { $$type: 'time-string', value: max },
	},
} );

describe( 'TimeRangeControl', () => {
	it( 'should render Start time and End time labels', () => {
		// Arrange.
		const props = {
			setValue: jest.fn(),
			value: createValue( null, null ),
			bind: 'time_range',
			propType,
		};

		// Act.
		renderControl( <TimeRangeControl />, props );

		// Assert.
		expect( screen.getByText( 'Start time' ) ).toBeInTheDocument();
		expect( screen.getByText( 'End time' ) ).toBeInTheDocument();
	} );

	it( 'should render existing min and max time values', () => {
		// Arrange.
		const props = {
			setValue: jest.fn(),
			value: createValue( '09:00', '17:30' ),
			bind: 'time_range',
			propType,
		};

		// Act.
		renderControl( <TimeRangeControl />, props );

		// Assert.
		expect( ( screen.getByLabelText( 'Start time' ) as HTMLInputElement ).value ).toBe( '09:00 AM' );
		expect( ( screen.getByLabelText( 'End time' ) as HTMLInputElement ).value ).toBe( '05:30 PM' );
	} );

	it( 'should accept end time earlier than start time without showing an error', () => {
		// Arrange.
		const props = {
			setValue: jest.fn(),
			value: createValue( '22:00', '13:00' ),
			bind: 'time_range',
			propType,
		};

		// Act.
		renderControl( <TimeRangeControl />, props );

		// Assert.
		expect( screen.getByLabelText( 'Start time' ) ).toHaveAttribute( 'aria-invalid', 'false' );
		expect( screen.getByLabelText( 'End time' ) ).toHaveAttribute( 'aria-invalid', 'false' );
	} );

	it( 'should call setValue with merged min when start input changes', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: createValue( '09:00', '17:30' ),
			bind: 'time_range',
			propType,
		};

		renderControl( <TimeRangeControl />, props );

		// Act.
		fireEvent.change( screen.getByLabelText( 'Start time' ), { target: { value: '10:15 AM' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'time-range',
			value: {
				min: { $$type: 'time-string', value: '10:15' },
				max: { $$type: 'time-string', value: '17:30' },
			},
		} );
	} );

	it( 'should call setValue with merged max when end input changes', () => {
		// Arrange.
		const setValue = jest.fn();
		const props = {
			setValue,
			value: createValue( '09:00', '17:30' ),
			bind: 'time_range',
			propType,
		};

		renderControl( <TimeRangeControl />, props );

		// Act.
		fireEvent.change( screen.getByLabelText( 'End time' ), { target: { value: '06:45 PM' } } );

		// Assert.
		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'time-range',
			value: {
				min: { $$type: 'time-string', value: '09:00' },
				max: { $$type: 'time-string', value: '18:45' },
			},
		} );
	} );
} );
