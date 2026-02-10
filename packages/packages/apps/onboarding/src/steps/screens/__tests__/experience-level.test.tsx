import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@elementor/ui';

import { ExperienceLevel } from '../experience-level';

const renderWithTheme = ( ui: React.ReactElement ) => {
	return render( <ThemeProvider colorScheme="light">{ ui }</ThemeProvider> );
};

describe( 'ExperienceLevel', () => {
	it( 'renders title and subtitle', () => {
		const onSelect = jest.fn();

		renderWithTheme( <ExperienceLevel onSelect={ onSelect } /> );

		expect( screen.getByText( 'How much experience do you have with Elementor?' ) ).toBeInTheDocument();
		expect( screen.getByText( 'This helps us adjust the editor to your workflow.' ) ).toBeInTheDocument();
	} );

	it( 'renders all three options', () => {
		const onSelect = jest.fn();

		renderWithTheme( <ExperienceLevel onSelect={ onSelect } /> );

		expect( screen.getByText( "I'm just getting started" ) ).toBeInTheDocument();
		expect( screen.getByText( 'I have some experience' ) ).toBeInTheDocument();
		expect( screen.getByText( "I'm very comfortable with Elementor" ) ).toBeInTheDocument();
	} );

	it( 'calls onSelect when an option is clicked', () => {
		const onSelect = jest.fn();

		renderWithTheme( <ExperienceLevel onSelect={ onSelect } /> );

		fireEvent.click( screen.getByText( "I'm just getting started" ) );

		expect( onSelect ).toHaveBeenCalledWith( 'beginner' );
	} );

	it( 'shows selected state for the selected option', () => {
		const onSelect = jest.fn();

		renderWithTheme( <ExperienceLevel selectedValue="intermediate" onSelect={ onSelect } /> );

		const selectedOption = screen.getByText( 'I have some experience' ).closest( 'div' );
		expect( selectedOption ).toHaveStyle( { border: '2px solid' } );
	} );

	it( 'calls onSelect with correct value for each option', () => {
		const onSelect = jest.fn();

		renderWithTheme( <ExperienceLevel onSelect={ onSelect } /> );

		fireEvent.click( screen.getByText( "I'm just getting started" ) );
		expect( onSelect ).toHaveBeenCalledWith( 'beginner' );

		fireEvent.click( screen.getByText( 'I have some experience' ) );
		expect( onSelect ).toHaveBeenCalledWith( 'intermediate' );

		fireEvent.click( screen.getByText( "I'm very comfortable with Elementor" ) );
		expect( onSelect ).toHaveBeenCalledWith( 'advanced' );
	} );
} );
