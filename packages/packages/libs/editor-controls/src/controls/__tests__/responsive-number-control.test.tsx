import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { useActiveBreakpoint, useBreakpoints } from '@elementor/editor-responsive';
import { fireEvent, screen } from '@testing-library/react';

import { ResponsiveNumberControl } from '../responsive-number-control';

jest.mock( '@elementor/editor-responsive', () => ( {
	useActiveBreakpoint: jest.fn( () => 'tablet' ),
	useBreakpoints: jest.fn( () => [ { id: 'desktop' }, { id: 'tablet' }, { id: 'mobile' } ] ),
} ) );

const numberPropType = createMockPropType( { kind: 'plain', key: 'number' } );

const responsivePropType = createMockPropType( {
	kind: 'object',
	key: 'responsive',
	shape: {
		mobile: numberPropType,
		mobile_extra: numberPropType,
		tablet: numberPropType,
		tablet_extra: numberPropType,
		laptop: numberPropType,
		desktop: numberPropType,
		widescreen: numberPropType,
	},
} );

describe( 'ResponsiveNumberControl', () => {
	it( 'writes only the active breakpoint key', () => {
		const setValue = jest.fn();
		const value = {
			$$type: 'responsive',
			value: {
				desktop: { $$type: 'number', value: 3 },
			},
		};

		renderControl( <ResponsiveNumberControl />, {
			setValue,
			value,
			bind: 'slides_per_view',
			propType: responsivePropType,
		} );

		fireEvent.input( screen.getByRole( 'spinbutton' ), { target: { value: '2' } } );

		expect( setValue ).toHaveBeenCalledWith( {
			$$type: 'responsive',
			value: {
				desktop: { $$type: 'number', value: 3 },
				tablet: { $$type: 'number', value: 2 },
			},
		} );
		expect( useActiveBreakpoint ).toHaveBeenCalled();
		expect( useBreakpoints ).toHaveBeenCalled();
	} );

	it( 'shows the inherited wider value as a placeholder', () => {
		renderControl( <ResponsiveNumberControl />, {
			setValue: jest.fn(),
			value: {
				$$type: 'responsive',
				value: {
					desktop: { $$type: 'number', value: 3 },
				},
			},
			bind: 'slides_per_view',
			propType: responsivePropType,
		} );

		expect( screen.getByRole( 'spinbutton' ) ).toHaveAttribute( 'placeholder', '3' );
	} );
} );
