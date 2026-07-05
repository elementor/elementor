import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { AngieGuideCard } from '../angie-guide-card';

const defaultProps = {
	imageUrl: 'http://example.com/image.png',
	description: 'Test description',
	learnMoreUrl: 'http://example.com/learn',
	onClose: jest.fn(),
};

describe( 'AngieGuideCard', () => {
	it( 'renders the Try for free button when onInstall is provided', () => {
		// Arrange.
		const onInstall = jest.fn();

		// Act.
		renderWithTheme( <AngieGuideCard { ...defaultProps } onInstall={ onInstall } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: /try for free/i } ) ).toBeInTheDocument();
	} );

	it( 'does not render the Try for free button when onInstall is not provided', () => {
		// Act.
		renderWithTheme( <AngieGuideCard { ...defaultProps } /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: /try for free/i } ) ).not.toBeInTheDocument();
	} );

	it( 'always renders the Learn More button regardless of onInstall', () => {
		// Act.
		renderWithTheme( <AngieGuideCard { ...defaultProps } /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: /learn more/i } ) ).toBeInTheDocument();
	} );
} );
