import { render, fireEvent } from '@testing-library/react';
import { ItemHandle } from 'elementor-regions/navigator/components';
import { ElementProvider } from 'elementor-regions/navigator/context/item-context/providers';

require( 'elementor/tests/jest/setup/editor' );

const element = $e.run( 'document/elements/create', {
		model: {
			elType: 'widget',
			widgetType: 'heading',
		},
	} ),
	mockStore = {
		'document/elements': {
			test: element,
		},
	};

jest.mock( 'react-redux', () => ( {
	useSelector: jest.fn( ( selector ) => selector( mockStore ) ),
} ) );

describe( '<ItemHandle />', () => {
	beforeAll( () => {
		global.elementor.getContainer = jest.fn(
			( containerId ) => mockStore[ 'document/elements' ][ containerId ]
		);
	} );

	it( 'Should append provided class names', () => {
		const component = render(
			<ElementProvider itemId={ 'test' }>
				<ItemHandle className="test-class-name" />
			</ElementProvider>
		);

		expect( component.container.querySelector( '.elementor-navigator__item' ) ).toHaveClass(
			'elementor-navigator__item', // Initial class name
			'test-class-name' // Appended class name
		);
	} );

	it( 'Should append provided style properties', () => {
		const style = { content: 'test-value' },
			component = render(
				<ElementProvider itemId={ 'test' }>
					<ItemHandle style={ style } />
				</ElementProvider>
			);

		expect( component.container.querySelector( '.elementor-navigator__item' ) ).toHaveStyle( style );
	} );

	it( 'Should render item title', () => {
		const component = render(
			<ElementProvider itemId={ 'test' }>
				<ItemHandle />
			</ElementProvider>
		);

		expect(
			component.container.querySelector( '.elementor-navigator__element__title' )
		).toBeInTheDocument();
	} );

	it( 'Should render item icon', () => {
		const component = render(
			<ElementProvider itemId={ 'test' }>
				<ItemHandle />
			</ElementProvider>
		);

		expect(
			component.container.querySelector( '.elementor-navigator__element__element-type' )
		).toBeInTheDocument();
	} );

	it( 'Should indent item by nesting level', () => {
		const level = 5,
			component = render(
				<ElementProvider itemId={ 'test' } level={ level }>
					<ItemHandle />
				</ElementProvider>
			);

		expect( component.container.querySelector( '.elementor-navigator__item' ) ).toHaveStyle( {
			paddingLeft: level * 10,
		} );
	} );

	it( 'Should render toggle-folding button when `onToggleFolding` provided', () => {
		const component = render(
			<ElementProvider itemId={ 'test' }>
				<ItemHandle onToggleFolding={ () => {} } />
			</ElementProvider>
		);

		expect(
			component.queryByTitle( 'Toggle folding' )
		).toBeInTheDocument();
	} );

	it( 'Should not render toggle-folding button when `onToggleFolding` is `false`', () => {
		const component = render(
			<ElementProvider itemId={ 'test' }>
				<ItemHandle onToggleFolding={ false } />
			</ElementProvider>
		);

		expect(
			component.queryByTitle( 'Toggle folding' )
		).not.toBeInTheDocument();
	} );

	it( 'Should toggle folding on list-toggle click', () => {
		const handleToggleFolding = jest.fn(),
			component = render(
				<ElementProvider itemId={ 'test' }>
					<ItemHandle onToggleFolding={ handleToggleFolding } />
				</ElementProvider>
			);

		fireEvent.click(
			component.getByTitle( 'Toggle folding' )
		);

		expect( handleToggleFolding ).toBeCalledTimes( 1 );
	} );
} );
