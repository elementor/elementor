import { render } from '@testing-library/react';
import { ItemList } from 'elementor-regions/navigator/components';
import { ElementProvider } from 'elementor-regions/navigator/context/item-context/providers';

require( 'elementor/tests/jest/setup/editor' );

const section = $e.run( 'document/elements/create', {
		model: {
			id: 'test-section-1',
			elType: 'section',
		},
	} ),
	mockStore = {
		'document/elements': {
			'test-section-1': section,
			'test-column-1': section.children[ 0 ],
			'test-widget-1': $e.run( 'document/elements/create', {
				container: section.children[ 0 ],
				model: {
					id: 'test-widget-1',
					elType: 'widget',
					widgetType: 'button',
					sortable: false,
				},
			} ),
			'test-widget-2': $e.run( 'document/elements/create', {
				container: section.children[ 0 ],
				model: {
					id: 'test-widget-2',
					elType: 'widget',
					widgetType: 'button',
					sortable: false,
				},
			} ),
			'test-widget-3': $e.run( 'document/elements/create', {
				container: section.children[ 0 ],
				model: {
					id: 'test-widget-3',
					elType: 'widget',
					widgetType: 'button',
					sortable: false,
				},
			} ),
		},
		'document/elements/selection': [],
		'navigator/folding': {},
	};

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

describe( '<ItemList />', () => {
	beforeAll( () => {
		global.elementor.getContainer = jest.fn(
			( containerId ) => mockStore[ 'document/elements' ][ containerId ]
		);
	} );

	it( 'Should render given items', () => {
		const component = render(
			<ElementProvider itemId={ 'test-section-1' }>
				<ItemList
					items={
						elementor.getContainer( 'test-column-1' ).children.map(
							( container ) => container.id
						)
					} />
			</ElementProvider>
		);

		expect(
			component.queryAllByTestId( 'element-item' ).length
		).toEqual( 3 );
	} );

	it( 'Should not render items when not provided', () => {
		const component = render(
			<ElementProvider itemId={ 'test-section-1' }>
				<ItemList items={ [] } />
			</ElementProvider>
		);

		expect(
			component.queryAllByTestId( 'element-item' ).length
		).toEqual( 0 );
	} );

	it( 'Should not render empty state when items not provided and `indicateEmpty` is `false`', () => {
		const component = render(
			<ElementProvider itemId={ 'test-section-1' }>
				<ItemList items={ [] } indicateEmpty={ false } />
			</ElementProvider>
		);

		expect(
			component.queryByText( 'Empty' )
		).not.toBeInTheDocument();
	} );

	it( 'Should render empty state when items not provided and `indicateEmpty` is `true`', () => {
		const component = render(
			<ElementProvider itemId={ 'test-section-1' }>
				<ItemList items={ [] } indicateEmpty={ true } />
			</ElementProvider>
		);

		expect(
			component.queryByText( 'Empty' )
		).toBeInTheDocument();
	} );
} );
