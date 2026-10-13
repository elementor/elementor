import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { ajax } from '@elementor/editor-v1-adapters';
import { fireEvent, screen } from '@testing-library/react';

import { ImageControl } from '../image-control';
import { ImageMediaControl } from '../image-media-control';

jest.mock( '../image-media-control' );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	ajax: {
		load: jest.fn(),
	},
} ) );

const propType = createMockPropType( {
	kind: 'object',
	key: 'image',
	shape: {
		src: createMockPropType( { kind: 'union' } ),
		size: createMockPropType( { kind: 'plain' } ),
	},
} );

const promotion = {
	content: 'Optimize your images to enhance site performance by using Image Optimization.',
	buttonText: 'Install now',
	buttonUrl: 'https://example.com/install',
	dismissible: 'image_optimizer_hint',
};

const controlProps = {
	bind: 'image',
	setValue: jest.fn(),
	propType,
	value: {
		$$type: 'image',
		value: {
			size: 'medium',
			src: { $$type: 'image-src', value: { id: 1, url: null } },
		},
	},
};

describe( 'ImageOptimizeTrigger', () => {
	beforeEach( () => {
		jest.mocked( ImageMediaControl ).mockImplementation( () => <></> );
		jest.mocked( ajax.load ).mockResolvedValue( {} );
		( window as unknown as { elementor: unknown } ).elementor = {
			config: { user: { dismissed_editor_notices: [] } },
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should use the promotion label when one is provided', () => {
		// Act.
		renderControl( <ImageControl sizes={ [] } promotion={ { ...promotion, label: 'Improve' } } />, controlProps );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Improve' } ) ).toBeInTheDocument();
	} );

	it( 'should show the promotion title when one is provided', () => {
		// Arrange.
		renderControl(
			<ImageControl sizes={ [] } promotion={ { ...promotion, title: 'Make your site accessible' } } />,
			controlProps
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Optimize' } ) );

		// Assert.
		expect( screen.getByText( 'Make your site accessible' ) ).toBeInTheDocument();
	} );

	it( 'should close on escape without dismissing', () => {
		// Arrange.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, controlProps );
		const trigger = screen.getByRole( 'button', { name: 'Optimize' } );
		fireEvent.click( trigger );

		// Act.
		fireEvent.keyDown( document, { key: 'Escape' } );

		// Assert.
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( ajax.load ).not.toHaveBeenCalled();
	} );

	it( 'should close when clicking outside without dismissing', () => {
		// Arrange.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, controlProps );
		const trigger = screen.getByRole( 'button', { name: 'Optimize' } );
		fireEvent.click( trigger );

		// Act.
		fireEvent.mouseDown( document.body );

		// Assert.
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( ajax.load ).not.toHaveBeenCalled();
	} );

	it( 'should hide the popover without dismissing when close is clicked', () => {
		// Arrange.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, controlProps );
		const trigger = screen.getByRole( 'button', { name: 'Optimize' } );
		fireEvent.click( trigger );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		// Assert.
		expect( trigger ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( ajax.load ).not.toHaveBeenCalled();
	} );

	it( 'should hide the trigger for the session when the action is clicked', () => {
		// Arrange.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, controlProps );
		fireEvent.click( screen.getByRole( 'button', { name: 'Optimize' } ) );

		// Act.
		fireEvent.click( screen.getByRole( 'link', { name: 'Install now' } ) );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Optimize' } ) ).not.toBeInTheDocument();
		expect( ajax.load ).not.toHaveBeenCalled();

		const extendedWindow = window as unknown as {
			elementor: { config: { user: { dismissed_editor_notices: string[] } } };
		};
		expect( extendedWindow.elementor.config.user.dismissed_editor_notices ).toContain( 'image_optimizer_hint' );
	} );

	it( 'should persist the dismissal and hide the trigger', () => {
		// Arrange.
		renderControl( <ImageControl sizes={ [] } promotion={ promotion } />, controlProps );
		fireEvent.click( screen.getByRole( 'button', { name: 'Optimize' } ) );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Optimize' } ) ).not.toBeInTheDocument();
		expect( ajax.load ).toHaveBeenCalledWith( {
			action: 'dismissed_editor_notices',
			unique_id: 'dismiss-editor-notice-image_optimizer_hint',
			data: { dismissId: 'image_optimizer_hint' },
		} );
	} );
} );
