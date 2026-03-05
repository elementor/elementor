import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { UnitSelector } from '../unit-selector';

describe( 'UnitSelector', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Rendering', () => {
		it( 'should render button with current value', () => {
			render( <UnitSelector value="px" options={ [ 'px', 'rem' ] } onSelect={ jest.fn() } isActive /> );

			const button = screen.getByRole( 'button', { name: 'px' } );

			expect( button ).toBeInTheDocument();
			expect( button ).toHaveTextContent( 'px' );
		} );

		it( 'should render all options in menu when menu is open', () => {
			render( <UnitSelector value="px" options={ [ 'px', 'rem', 'ch' ] } onSelect={ jest.fn() } isActive /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'px' } ) );

			expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();
			expect( screen.getByText( 'PX' ) ).toBeInTheDocument();
			expect( screen.getByText( 'REM' ) ).toBeInTheDocument();
			expect( screen.getByText( 'CH' ) ).toBeInTheDocument();
		} );

		it( 'should not throw error when options is empty', () => {
			expect( () =>
				render( <UnitSelector options={ [] } value={ '' as 'px' } onSelect={ jest.fn() } isActive /> )
			).not.toThrow();
		} );

		it( 'should override label for selected value', () => {
			render(
				<UnitSelector
					options={ [ 'px', 'em', 'rem' ] }
					value="px"
					onSelect={ jest.fn() }
					isActive={ false }
					optionLabelOverrides={ { px: 'Pixels' } }
				/>
			);

			expect( screen.getByText( 'Pixels' ) ).toBeInTheDocument();
		} );

		it( 'should uses label overrides for menu items (override wins)', () => {
			render(
				<UnitSelector
					options={ [ 'px', 'em', 'rem' ] }
					value="px"
					onSelect={ jest.fn() }
					isActive={ false }
					optionLabelOverrides={ {
						em: 'Ems',
						rem: 'Rems',
					} }
				/>
			);

			fireEvent.click( screen.getByRole( 'button', { name: 'px' } ) );

			expect( screen.getByText( 'Ems' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Rems' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'onSelect', () => {
		it( 'should call onSelect with selected option and close menu when option is clicked', () => {
			const onSelect = jest.fn();

			render( <UnitSelector value="px" options={ [ 'px', 'rem' ] } onSelect={ onSelect } isActive /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'px' } ) );

			const remOption = screen.getByRole( 'menuitem', { name: 'REM' } );

			expect( screen.getByRole( 'menu' ) ).toBeInTheDocument();

			fireEvent.click( remOption );

			expect( onSelect ).toHaveBeenCalledTimes( 1 );
			expect( onSelect ).toHaveBeenCalledWith( 'rem' );
			expect( screen.queryByRole( 'menu' ) ).not.toBeInTheDocument();
		} );
	} );
} );
