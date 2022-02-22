import { render, fireEvent, waitFor } from '@testing-library/react';
import { ItemTitle } from 'elementor-regions/navigator/components';

require( 'elementor/tests/jest/setup/editor' );

describe( '<ItemTitle />', () => {
	const title = 'item-title';

	it( 'Should render title', () => {
		const component = render(
			<ItemTitle title={ title } />
		);

		expect(
			component.queryByText( title )
		).toBeInTheDocument();
	} );

	it( 'Should enter edit-mode when title double-clicked', () => {
		const component = render(
				<ItemTitle title={ title } />
			);

		fireEvent.doubleClick(
			component.getByText( title )
		);

		expect(
			component.container.querySelector( '[contenteditable]' )
		).not.toBeNull();
	} );

	it( 'Should update title when enter pressed', async () => {
		const newTitle = 'new-item-title',
			handleTitleEdit = jest.fn(),
			component = render(
				<ItemTitle title={ title } onTitleEdit={ handleTitleEdit } />
			),
			titleComponent = component.getByText( title );

		fireEvent.doubleClick( titleComponent );

		titleComponent.innerText = newTitle;

		fireEvent.keyPress(
			titleComponent,
			{ key: 'Enter', code: 13, charCode: 13 }
		);

		expect( handleTitleEdit ).toBeCalledTimes( 1 );
		expect( handleTitleEdit ).toBeCalledWith( newTitle );
	} );

	it( 'Should update title on blur', async () => {
		const newTitle = 'new-item-title',
			handleTitleEdit = jest.fn(),
			component = render(
				<ItemTitle title={ title } onTitleEdit={ handleTitleEdit } />
			),
			titleComponent = component.getByText( title );

		fireEvent.doubleClick( titleComponent );

		titleComponent.innerText = newTitle;

		fireEvent.blur( titleComponent );

		expect( handleTitleEdit ).toBeCalledTimes( 1 );
		expect( handleTitleEdit ).toBeCalledWith( newTitle );
	} );

	it( 'Should not update title when empty', async () => {
		const newTitle = '',
			handleTitleEdit = jest.fn(),
			component = render(
				<ItemTitle title={ title } onTitleEdit={ handleTitleEdit } />
			),
			titleComponent = component.getByText( title );

		fireEvent.doubleClick( titleComponent );

		titleComponent.innerText = newTitle;

		fireEvent.blur( titleComponent );

		expect( handleTitleEdit ).not.toBeCalled();
	} );
} );
