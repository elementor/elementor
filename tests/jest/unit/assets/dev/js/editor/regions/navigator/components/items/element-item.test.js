import { render, fireEvent } from '@testing-library/react';
import { BASE_ITEM_CLASS, ElementItem } from 'elementor-regions/navigator/components/items';

require( 'elementor/tests/jest/setup/editor' );

const mockSetElementFolding = jest.fn(),
	mockSetElementSelection = jest.fn(),
	preview = elementor.getPreviewContainer(),
	mockElements = {
		document: {
			...preview,
			model: {
				...preview.model,
				trigger: jest.fn(),
			},
			sortable: false,
		},
		'test-section-1': $e.run( 'document/elements/create', {
			container: preview,
			model: {
				id: 'test-section-1',
				elType: 'section',
				sortable: false,
			},
		} ),
	},
	mockStore = {
		'document/elements': Object.fromEntries( Object.entries( mockElements ).map(
			( [ key, value ] ) => [ key, {
				...value.model.toJSON(),
				elements: value.children.map( ( container ) => container.id ),
			} ]
		) ),
		'document/elements/selection': [],
		'navigator/folding': {},
	};

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

jest.mock( 'elementor', () => ( {
	helpers:{
		scrollToView: jest.fn(),
	}
} ) );

jest.mock( 'elementor-assets-js/editor/regions/navigator/hooks', () => ( {
	...jest.requireActual( 'elementor-assets-js/editor/regions/navigator/hooks' ),
	useElementFolding: ( elementId ) => [ mockStore[ 'navigator/folding' ][ elementId ], mockSetElementFolding ],
	useElementSelection: ( elementId ) => [
		mockStore[ 'document/elements/selection' ].indexOf( elementId ) > -1,
		mockSetElementSelection,
	],
} ) );

describe( '<ElementItem />', () => {
	beforeAll( () => {
		global.elementor.getContainer = jest.fn(
			( containerId ) => mockElements[ containerId ]
		);

		global.$e.store = {
			getState: jest.fn(
				( sliceId ) => sliceId ? mockStore[ sliceId ] : mockStore
			),
		};
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'Should toggle element selection on click', () => {
		const component = render(
			<ElementItem itemId="document" />
		);

		fireEvent.click(
			component.getAllByRole( 'treeitem' )[ 0 ]
		);

		expect( mockSetElementSelection ).toBeCalledTimes( 1 );
	} );

	it( 'Should open context-menu on right-click', () => {
		const component = render(
			<ElementItem itemId="document" />
		);

		fireEvent.contextMenu(
			component.getAllByRole( 'treeitem' )[ 0 ]
		);

		expect(
			elementor.getContainer( 'document' ).model.trigger
		).toBeCalledTimes( 1 );
	} );

	it( 'Should have a suitable data-id attribute', () => {
		const itemId = 'document',
			component = render(
				<ElementItem itemId={ itemId } />
			);

		expect(
			component.getAllByRole( 'treeitem' )[ 0 ]
		).toHaveAttribute( 'data-id', itemId );
	} );

	it( 'Should use `${ BASE_ITEM_CLASS }--has-children` class when has children', () => {
		const component = render(
			<ElementItem itemId="document" />
		);

		expect(
			component.queryAllByRole( 'treeitem' )[ 0 ]
		).toHaveClass( `${ BASE_ITEM_CLASS }--has-children` );
	} );

	it( 'Should not use `${ BASE_ITEM_CLASS }--has-children` class when has no children', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.queryByRole( 'treeitem' )
		).not.toHaveClass( `${ BASE_ITEM_CLASS }--has-children` );
	} );

	it( 'Should use `${ BASE_ITEM_CLASS }--hidden` class when element is hidden', () => {
		mockStore[ 'document/elements' ][ 'test-section-1' ].hidden = true;

		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.queryByRole( 'treeitem' )
		).toHaveClass( `${ BASE_ITEM_CLASS }--hidden` );

		// Cleanup
		mockStore[ 'document/elements' ][ 'test-section-1' ] = false;
	} );

	it( 'Should not use `${ BASE_ITEM_CLASS }--hidden` class when element is not hidden', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.queryByRole( 'treeitem' )
		).not.toHaveClass( `${ BASE_ITEM_CLASS }--hidden` );
	} );

	it( 'Should render item-handle', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.container.querySelector( '.elementor-navigator__item' )
		).toBeInTheDocument();
	} );

	it( 'Should render toggle-visibility button', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.queryByTitle( 'Toggle visibility' )
		).toBeInTheDocument();
	} );

	it( 'Should render item-list', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.queryByRole( 'tree' )
		).toBeInTheDocument();
	} );

	it( 'Should append `elementor-root` class to item-handle when it\'s the document element', () => {
		const component = render(
			<ElementItem itemId="document" />
		);

		expect(
			component.container.querySelectorAll( '.elementor-navigator__item' )[ 0 ]
		).toHaveClass( 'elementor-root' );
	} );

	it( 'Should append `elementor-editing` class to item-handle when selection is active', () => {
		mockStore[ 'document/elements/selection' ].push( 'test-section-1' );

		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.container.querySelector( '.elementor-navigator__item' )
		).toHaveClass( 'elementor-editing' );

		// Cleanup
		mockStore[ 'document/elements/selection' ].splice(
			mockStore[ 'document/elements/selection' ].indexOf( 'test-section-1' ),
			1
		);
	} );

	it( 'Should not append `elementor-active` class to item-handle when selection is inactive', () => {
		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.container.querySelector( '.elementor-navigator__item' )
		).not.toHaveClass( 'elementor-editing' );
	} );

	it( 'Should append `elementor-active` class to item-handle when folding is active', () => {
		mockStore[ 'navigator/folding' ][ 'test-section-1' ] = true;

		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.container.querySelector( '.elementor-navigator__item' )
		).toHaveClass( 'elementor-active' );

		// Cleanup
		delete mockStore[ 'navigator/folding' ][ 'test-section-1' ];
	} );

	it( 'Should not append `elementor-active` class to item-handle when folding is inactive', () => {
		mockStore[ 'navigator/folding' ][ 'test-section-1' ] = false;

		const component = render(
			<ElementItem itemId="test-section-1" />
		);

		expect(
			component.container.querySelector( '.elementor-navigator__item' )
		).not.toHaveClass( 'elementor-active' );

		// Cleanup
		delete mockStore[ 'navigator/folding' ][ 'test-section-1' ];
	} );
} );
