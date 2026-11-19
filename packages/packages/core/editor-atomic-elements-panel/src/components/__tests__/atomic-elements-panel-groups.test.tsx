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
