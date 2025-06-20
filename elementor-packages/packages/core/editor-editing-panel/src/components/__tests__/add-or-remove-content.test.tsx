import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { AddOrRemoveContent } from '../add-or-remove-content';

describe( '<AddOrRemoveContent />', () => {
	it( 'should not show content if isAdded is false', () => {
		// Arrange.
		const onAdd = jest.fn();
		const onRemove = jest.fn();
		const isAdded = false;

		// Act.
		renderWithTheme(
			<AddOrRemoveContent
				onAdd={ onAdd }
				onRemove={ onRemove }
				isAdded={ isAdded }
				renderLabel={ () => <div>Label</div> }
			>
				<div>Content</div>
			</AddOrRemoveContent>
		);

		// Assert.
		expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();

		// Act.
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );

		// Assert.
		expect( onAdd ).toHaveBeenCalled();
	} );

	it( 'should show content if isAdded is true', () => {
		// Arrange.
		const onAdd = jest.fn();
		const onRemove = jest.fn();
		const isAdded = true;

		// Act.
		renderWithTheme(
			<AddOrRemoveContent
				onAdd={ onAdd }
				onRemove={ onRemove }
				isAdded={ isAdded }
				renderLabel={ () => <div>Label</div> }
			>
				<div>Content</div>
			</AddOrRemoveContent>
		);

		// Assert.
		expect( screen.getByText( 'Content' ) ).toBeVisible();

		// Act.
		const button = screen.getByRole( 'button' );
		fireEvent.click( button );

		// Assert.
		expect( onRemove ).toHaveBeenCalled();
	} );
} );
