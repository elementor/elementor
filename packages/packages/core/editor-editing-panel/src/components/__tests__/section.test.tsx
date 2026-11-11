import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Section } from '../section';

jest.mock( '../../hooks/use-state-by-element', () => ( {
	useStateByElement: ( _key: string, initialValue: boolean ) =>
		jest.requireActual( 'react' ).useState( initialValue ),
} ) );

const SECTION_TITLE = 'Typography';

describe( 'Section', () => {
	it( 'does not toggle the section when a title action is clicked', () => {
		// Arrange.
		const onActionClick = jest.fn();
		render(
			<Section
				title={ SECTION_TITLE }
				titleActions={
					<button type="button" onClick={ onActionClick }>
						Action
					</button>
				}
			>
				<span>Content</span>
			</Section>
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Action' } ) );

		// Assert.
		expect( onActionClick ).toHaveBeenCalledTimes( 1 );
		expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();
	} );

	it( 'toggles the section when the header is clicked', () => {
		// Arrange.
		render(
			<Section title={ SECTION_TITLE }>
				<span>Content</span>
			</Section>
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: `${ SECTION_TITLE } section` } ) );

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeInTheDocument();
	} );
} );
