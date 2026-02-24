import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { CompletionScreen } from '../completion-screen';

describe( 'CompletionScreen', () => {
	it( 'should render loading title', () => {
		render( <CompletionScreen /> );

		expect( screen.getByText( 'Getting things ready' ) ).toBeInTheDocument();
	} );

	it( 'should render loading subtitle', () => {
		render( <CompletionScreen /> );

		expect( screen.getByText( 'Tailoring the editor to your goals and workflow\u2026' ) ).toBeInTheDocument();
	} );

	it( 'should render both title and subtitle together', () => {
		render( <CompletionScreen /> );

		expect( screen.getByText( 'Getting things ready' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Tailoring the editor to your goals and workflow\u2026' ) ).toBeInTheDocument();
	} );
} );
