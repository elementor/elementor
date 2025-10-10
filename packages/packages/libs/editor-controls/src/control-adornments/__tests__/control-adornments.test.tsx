import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { render, screen } from '@testing-library/react';

import { ControlLabel } from '../../components/control-label';
import { ControlAdornments } from '../control-adornments';
import { ControlAdornmentsProvider } from '../control-adornments-context';

describe( '<ControlLabel />', () => {
	it( 'should render the label with all passed adornments', () => {
		// Arrange.
		const adornments = [
			{ Adornment: () => <span>adornment 1</span>, id: '1' },
			{ Adornment: () => <span>adornment 2</span>, id: '2' },
		];

		// Act.
		render(
			<ControlAdornmentsProvider items={ adornments }>
				<ControlLabel>Test label</ControlLabel>
			</ControlAdornmentsProvider>
		);

		// Assert.
		expect( screen.getByText( 'adornment 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'adornment 2' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test label' ) ).toBeInTheDocument();
	} );

	it( 'should render only the children if no adornments are passed', () => {
		// Act.
		render(
			<ControlAdornmentsProvider items={ [] }>
				<ControlLabel>Test label</ControlLabel>
			</ControlAdornmentsProvider>
		);

		// Assert.
		expect( screen.queryByText( 'adornment 1' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'adornment 2' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Test label' ) ).toBeInTheDocument();
	} );
} );

describe( '<ControlAdornments />', () => {
	it( 'should render all passed adornments', () => {
		// Arrange.
		const adornments = [
			{ Adornment: () => <span>adornment 1</span>, id: '1' },
			{ Adornment: () => <span>adornment 2</span>, id: '2' },
		];

		// Act.
		renderWithTheme(
			<ControlAdornmentsProvider items={ adornments }>
				<ControlAdornments />
			</ControlAdornmentsProvider>
		);

		// Assert.
		expect( screen.getByText( 'adornment 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'adornment 2' ) ).toBeInTheDocument();
	} );

	it( 'should not render anything if no adornments are passed', () => {
		// Act.
		renderWithTheme(
			<ControlAdornmentsProvider items={ [] }>
				<div data-testid="test">
					<ControlAdornments />
				</div>
			</ControlAdornmentsProvider>
		);

		// Assert.
		// eslint-disable-next-line testing-library/no-test-id-queries
		expect( screen.getByTestId( 'test' ) ).toBeEmptyDOMElement();
	} );
} );
