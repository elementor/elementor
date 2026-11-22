import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useAtomicWidgets } from '../../hooks/use-atomic-widgets';
import { AtomicElementsPanel } from '../atomic-elements-panel';

jest.mock( '../../hooks/use-atomic-widgets' );
jest.mock( '../elements-panel-switcher', () => ( { ElementsPanelSwitcher: () => null } ) );
jest.mock( '@elementor/editor-panels', () => {
	const Passthrough = ( { children }: React.PropsWithChildren ) => <div>{ children }</div>;

	return {
		Panel: Passthrough,
		PanelBody: Passthrough,
		PanelHeader: Passthrough,
		PanelHeaderTitle: Passthrough,
	};
} );

const widgets = {
	'e-flexbox': { title: 'Flexbox', atomic: true, controls: {} },
	'e-heading': { title: 'Heading', atomic: true, controls: {} },
	'e-form-input': { title: 'Input', atomic: true, controls: {}, categories: [ 'atomic-form' ] },
};

const props = { isBlocked: false, open: jest.fn(), close: jest.fn() };

describe( 'AtomicElementsPanel groups', () => {
	it( 'should render a labeled group per non-empty category with its tiles', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );

		// Act.
		render( <AtomicElementsPanel { ...props } /> );

		// Assert.
		expect( screen.getAllByRole( 'button', { expanded: true } ).map( ( { textContent } ) => textContent ) ).toEqual(
			[ 'Layout', 'Basic', 'Form' ]
		);
		expect( screen.getByRole( 'button', { name: 'Flexbox' } ) ).toBeInTheDocument();
	} );

	it( 'should collapse and expand a group and update aria-expanded', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );
		const header = screen.getByRole( 'button', { name: 'Layout' } );

		// Act.
		fireEvent.click( header );

		// Assert.
		expect( header ).toHaveAttribute( 'aria-expanded', 'false' );

		// Act.
		fireEvent.click( header );

		// Assert.
		expect( header ).toHaveAttribute( 'aria-expanded', 'true' );
	} );

	it( 'should render the empty state when there are no eligible widgets', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( {} );

		// Act.
		render( <AtomicElementsPanel { ...props } /> );

		// Assert.
		expect( screen.getByText( 'No atomic elements available.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { expanded: true } ) ).not.toBeInTheDocument();
	} );
} );

describe( 'AtomicElementsPanel search', () => {
	it( 'should filter tiles by title and hide empty groups', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'HEAD' } } );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Heading' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Flexbox' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument();
	} );

	it( 'should match by keyword', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( {
			'e-heading': { title: 'Heading', atomic: true, controls: {}, keywords: [ 'title' ] },
		} as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'title' } } );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Heading' } ) ).toBeInTheDocument();
	} );

	it( 'should show a no-results message, and restore the list when cleared', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'zzz' } } );

		// Assert.
		expect( screen.getAllByText( /No elements found/ ).length ).toBeGreaterThan( 0 );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: '' } } );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeInTheDocument();
	} );

	it( 'should match by widget type', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'e-flex' } } );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Flexbox' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Heading' } ) ).not.toBeInTheDocument();
	} );

	it( 'should announce the results count', () => {
		// Arrange.
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'e-' } } );

		// Assert.
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( '3 elements found.' );
	} );

	it( 'should keep a matching locked tile in the results', () => {
		// Arrange.
		( window as unknown as { elementor: unknown } ).elementor = {
			config: {
				atomicWidgetPromotions: [
					{ type: 'pro', widgets: [ { name: 'e-pro-carousel', title: 'Pro Carousel', categories: '[]' } ] },
				],
			},
		};
		jest.mocked( useAtomicWidgets ).mockReturnValue( widgets as never );
		render( <AtomicElementsPanel { ...props } /> );

		// Act.
		fireEvent.change( screen.getByRole( 'searchbox' ), { target: { value: 'carousel' } } );

		// Assert.
		expect( screen.getAllByRole( 'button', { name: /Pro Carousel/ } ) ).toHaveLength( 1 );
		expect( screen.queryByRole( 'button', { name: 'Flexbox' } ) ).not.toBeInTheDocument();

		delete ( window as unknown as { elementor?: unknown } ).elementor;
	} );
} );
