import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { DesignSystemHome } from '../design-system-home';

jest.mock( '@elementor/icons', () => ( {
	ChevronRightIcon: () => <span aria-hidden="true" />,
	ColorFilterIcon: () => <span aria-hidden="true" />,
	ColorSwatchIcon: () => <span aria-hidden="true" />,
	TextIcon: () => <span aria-hidden="true" />,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '@elementor/ui', () => ( {
	Box: ( { children, ...rest }: React.ComponentProps<'div'> ) => <div { ...rest }>{ children }</div>,
	Rotate: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
	Stack: ( { children, ...rest }: React.ComponentProps<'div'> ) => <div { ...rest }>{ children }</div>,
	Typography: ( { children }: { children: React.ReactNode } ) => <span>{ children }</span>,
	useTheme: () => ( { direction: 'ltr' } ),
} ) );

describe( 'DesignSystemHome', () => {
	it( 'should call onSelect with the variables tab when Variables is activated', () => {
		const onSelect = jest.fn();

		render( <DesignSystemHome onSelect={ onSelect } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Variables' } ) );

		expect( onSelect ).toHaveBeenCalledWith( 'variables' );
	} );

	it( 'should call onSelect with defaults when Default styles is activated', () => {
		const onSelect = jest.fn();

		render( <DesignSystemHome onSelect={ onSelect } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Default styles' } ) );

		expect( onSelect ).toHaveBeenCalledWith( 'defaults' );
	} );

	it( 'should call onSelect when a row is activated with the keyboard', () => {
		const onSelect = jest.fn();

		render( <DesignSystemHome onSelect={ onSelect } /> );

		const classesRow = screen.getByRole( 'button', { name: 'Classes' } );
		fireEvent.keyDown( classesRow, { key: 'Enter' } );

		expect( onSelect ).toHaveBeenCalledWith( 'classes' );
	} );
} );