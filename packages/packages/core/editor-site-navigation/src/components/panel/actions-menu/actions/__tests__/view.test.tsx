import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type Post } from '../../../../../types';
import View from '../view';

describe( '@elementor/editor-site-navigation - View', () => {
	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should open page in a different tab', () => {
		// Arrange.
		const spy = jest.spyOn( window, 'open' );
		spy.mockImplementation( () => null );
		const page: Post = {
			id: 1,
			title: { rendered: 'Page Title' },
			link: 'mock-link',
			status: 'publish',
			type: 'page',
			user_can: {
				edit: true,
				delete: true,
			},
		};

		// Act.
		renderWithTheme( <View post={ page } /> );
		const button = screen.getByRole( 'menuitem' );

		// Open menu
		fireEvent.click( button );

		// Assert.
		expect( spy ).toHaveBeenCalledTimes( 1 );
		expect( spy ).toHaveBeenCalledWith( 'mock-link', '_blank' );
	} );
} );
