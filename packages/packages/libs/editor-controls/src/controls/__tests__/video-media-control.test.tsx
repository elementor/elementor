import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { videoSrcPropTypeUtil } from '@elementor/editor-props';
import { useWpMediaAttachment, useWpMediaFrame } from '@elementor/wp-media';
import { fireEvent, screen } from '@testing-library/react';

import { VideoMediaControl } from '../video-media-control';

jest.mock( '@elementor/wp-media', () => ( {
	useWpMediaAttachment: jest.fn(),
	useWpMediaFrame: jest.fn(),
} ) );

const propType = createMockPropType( {
	kind: 'object',
	key: 'video-src',
	shape: {
		id: createMockPropType( { kind: 'plain' } ),
		url: createMockPropType( { kind: 'plain' } ),
	},
} );

describe( 'VideoMediaControl', () => {
	beforeEach( () => {
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {} as never );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should accept mcp-shaped video-src with id only', () => {
		// Arrange.
		const mcpValue = {
			$$type: 'video-src',
			value: {
				id: {
					$$type: 'video-attachment-id',
					value: 8619,
				},
			},
		};

		// Assert.
		expect( videoSrcPropTypeUtil.isValid( mcpValue ) ).toBe( true );
		expect( videoSrcPropTypeUtil.extract( mcpValue ) ).toEqual( mcpValue.value );
	} );

	it( 'should display attachment video from wp media when id is set without url', () => {
		// Arrange.
		jest.mocked( useWpMediaAttachment ).mockReturnValue( {
			data: {
				id: 8619,
				url: 'https://localhost/library-video.mp4',
			},
		} as never );
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const setValue = jest.fn();
		const value = {
			$$type: 'video-src',
			value: {
				id: {
					$$type: 'video-attachment-id',
					value: 8619,
				},
			},
		};

		const props = { setValue, value, bind: 'source', propType };

		// Act.
		renderControl( <VideoMediaControl />, props );

		const control = document.querySelector( 'video' );

		// Assert.
		expect( control ).toHaveAttribute( 'src', 'https://localhost/library-video.mp4' );
	} );

	it( 'should display video from external url', () => {
		// Arrange.
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open: jest.fn() } );

		const setValue = jest.fn();
		const value = {
			$$type: 'video-src',
			value: {
				id: null,
				url: {
					$$type: 'url',
					value: 'https://localhost/video.mp4',
				},
			},
		};

		const props = { setValue, value, bind: 'source', propType };

		// Act.
		renderControl( <VideoMediaControl />, props );

		const control = document.querySelector( 'video' );

		// Assert.
		expect( control ).toHaveAttribute( 'src', 'https://localhost/video.mp4' );
	} );

	it( 'should open wp media frame in url mode when clicking insert from url', () => {
		// Arrange.
		const open = jest.fn();
		jest.mocked( useWpMediaFrame ).mockReturnValue( { open } );

		const setValue = jest.fn();
		const props = { setValue, value: {}, bind: 'source', propType };

		// Act.
		renderControl( <VideoMediaControl />, props );
		fireEvent.click( screen.getByRole( 'button', { name: 'Insert from URL' } ) );

		// Assert.
		expect( open ).toHaveBeenCalledWith( { mode: 'url', currentUrl: undefined } );
	} );
} );
