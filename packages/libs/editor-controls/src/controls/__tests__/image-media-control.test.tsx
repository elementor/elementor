import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { fireEvent, screen } from '@testing-library/react';

import { ImageMediaControl } from '../image-media-control';

jest.mock( '@elementor/wp-media', () => ( {
	useWpMediaAttachment: jest.fn(),
	useWpMediaFrame: jest.fn(),
} ) );

const propType = createMockPropType( {
	kind: 'object',
	key: 'image-src',
	shape: {
		id: createMockPropType( { kind: 'plain' } ),
		url: createMockPropType( { kind: 'plain' } ),
	},
} );

describe( 'ImageMediaControl', () => {
	beforeEach( () => {
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {} as never );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should display attachment image from WP Media', () => {
		// Arrange.
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				id: 1,
				url: 'https://localhost/image.png',
			},
		} as never );

		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const setValue = jest.fn();
		const value = {
			$$type: 'image-src',
			value: {
				id: 1,
			},
		};

		const props = { setValue, value, bind: 'src', propType };

		// Act.
		renderControl( <ImageMediaControl />, props );

		const control = screen.getByRole( 'img' );

		// Assert.
		expect( getComputedStyle( control ).backgroundImage ).toBe( 'url(https://localhost/image.png)' );
	} );

	it( 'should display image from image-url', () => {
		// Arrange.
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const setValue = jest.fn();
		const value = {
			$$type: 'image-src',
			value: {
				id: null,
				url: {
					$$type: 'image-url',
					value: 'https://localhost/image.png',
				},
			},
		};

		const props = { setValue, value, bind: 'src', propType };

		// Act.
		renderControl( <ImageMediaControl />, props );

		const control = screen.getByRole( 'img' );

		// Assert.
		expect( getComputedStyle( control ).backgroundImage ).toBe( 'url(https://localhost/image.png)' );
	} );

	it( 'should open wp media frame in browse mode when clicking on select image', () => {
		// Arrange.
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const setValue = jest.fn();

		const props = { setValue, value: {}, bind: 'src', propType };
		// Act.
		renderControl( <ImageMediaControl />, props );
		const selectImage = screen.getByRole( 'button', { name: 'Select image' } );

		fireEvent.click( selectImage );

		// Assert.
		expect( open ).toHaveBeenCalledWith( { mode: 'browse' } );
	} );

	it( 'should open wp media frame in upload mode when clicking on upload image', () => {
		// Arrange.
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const setValue = jest.fn();

		const props = { setValue, value: {}, bind: 'src', propType };

		// Act.
		renderControl( <ImageMediaControl />, props );

		const uploadImage = screen.getByRole( 'button', { name: 'Upload' } );

		fireEvent.click( uploadImage );

		// Assert.
		expect( open ).toHaveBeenCalledWith( { mode: 'upload' } );
	} );
} );
