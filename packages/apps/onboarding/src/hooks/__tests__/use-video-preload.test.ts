import { act, renderHook } from '@testing-library/react';

jest.mock( '../../steps/step-visuals', () => ( {
	getVideoUrls: jest.fn(),
} ) );

import { getVideoUrls } from '../../steps/step-visuals';
import { isVideoPreloaded, useVideoPreload } from '../use-video-preload';

const mockGetVideoUrls = getVideoUrls as jest.MockedFunction< typeof getVideoUrls >;

describe( 'use-video-preload', () => {
	let mockVideoElement: {
		addEventListener: jest.Mock;
		removeEventListener: jest.Mock;
		load: jest.Mock;
		src: string;
		preload: string;
	};

	const originalCreateElement = document.createElement.bind( document );

	beforeEach( () => {
		mockVideoElement = {
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
			load: jest.fn(),
			src: '',
			preload: '',
		};

		jest.spyOn( document, 'createElement' ).mockImplementation( ( tag: string, ...args: [] ) => {
			if ( tag === 'video' ) {
				return mockVideoElement as unknown as HTMLVideoElement;
			}
			return originalCreateElement( tag, ...args );
		} );

		mockGetVideoUrls.mockReturnValue( [] );
	} );

	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'isVideoPreloaded', () => {
		it( 'should return false for a URL that has not been preloaded', () => {
			expect( isVideoPreloaded( 'https://example.com/never-preloaded.webm' ) ).toBe( false );
		} );
	} );

	describe( 'useVideoPreload', () => {
		it( 'should mark URL as preloaded after canplaythrough event', async () => {
			const url = 'https://example.com/test-canplay.webm';
			mockGetVideoUrls.mockReturnValue( [ url ] );

			let canPlayThrough: ( () => void ) | undefined;
			mockVideoElement.addEventListener.mockImplementation( ( event: string, handler: () => void ) => {
				if ( event === 'canplaythrough' ) {
					canPlayThrough = handler;
				}
			} );

			renderHook( () => useVideoPreload() );
			expect( isVideoPreloaded( url ) ).toBe( false );

			await act( async () => {
				canPlayThrough?.();
			} );

			expect( isVideoPreloaded( url ) ).toBe( true );
		} );

		it( 'should not mark URL as preloaded after error event', async () => {
			const url = 'https://example.com/test-error-url.webm';
			mockGetVideoUrls.mockReturnValue( [ url ] );

			let errorHandler: ( () => void ) | undefined;
			mockVideoElement.addEventListener.mockImplementation( ( event: string, handler: () => void ) => {
				if ( event === 'error' ) {
					errorHandler = handler;
				}
			} );

			renderHook( () => useVideoPreload() );

			await act( async () => {
				errorHandler?.();
			} );

			expect( isVideoPreloaded( url ) ).toBe( false );
		} );

		it( 'should load videos sequentially, starting second after first completes', async () => {
			const url1 = 'https://example.com/sequential-1.webm';
			const url2 = 'https://example.com/sequential-2.webm';
			mockGetVideoUrls.mockReturnValue( [ url1, url2 ] );

			let canPlayThrough: ( () => void ) | undefined;
			mockVideoElement.addEventListener.mockImplementation( ( event: string, handler: () => void ) => {
				if ( event === 'canplaythrough' ) {
					canPlayThrough = handler;
				}
			} );

			renderHook( () => useVideoPreload() );

			const completeVideoLoading = async () => {
				await act( async () => {
					canPlayThrough?.();
				} );
			};

			expect( mockVideoElement.src ).toBe( url1 );

			await completeVideoLoading();

			expect( mockVideoElement.src ).toBe( url2 );
		} );
	} );
} );
