import React from 'react';
import { render, screen } from '@testing-library/react';
import AnnouncementBody from 'elementor/modules/announcements/assets/js/components/AnnouncementBody';

describe( 'AnnouncementBody Component', () => {
	describe( 'Video Media Type Rendering', () => {
		test( 'should render video iframe with correct attributes', () => {
			// Arrange
			const announcement = {
				title: 'Test Video Title',
				description: 'Test description',
				media: {
					type: 'video',
					src: 'https://www.youtube.com/embed/le72grP_Q6k',
				},
			};

			// Act
			render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const iframe = screen.getByTitle( 'Test Video Title' );
			expect( iframe ).toBeTruthy();
			expect( iframe.getAttribute( 'src' ) ).toBe( 'https://www.youtube.com/embed/le72grP_Q6k' );
			expect( iframe.getAttribute( 'allow' ) ).toBe( 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' );
			expect( iframe.getAttribute( 'allowFullScreen' ) ).toBe( '' );
			expect( iframe.getAttribute( 'loading' ) ).toBe( 'lazy' );
			expect( iframe.getAttribute( 'frameBorder' ) ).toBe( '0' );
		} );

		test( 'should render video container with correct className', () => {
			// Arrange
			const announcement = {
				title: 'Test Video Title',
				description: 'Test description',
				media: {
					type: 'video',
					src: 'https://www.youtube.com/embed/le72grP_Q6k',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const videoContainer = container.querySelector( '.announcement-body-media.announcement-body-video' );
			expect( videoContainer ).toBeTruthy();
		} );
	} );

	describe( 'Image Media Type Rendering', () => {
		test( 'should render image element with correct src', () => {
			// Arrange
			const announcement = {
				title: 'Test Image Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const image = screen.getByAltText( 'Announcement' );
			expect( image ).toBeTruthy();
			expect( image.getAttribute( 'src' ) ).toBe( 'https://example.com/image.jpg' );
		} );

		test( 'should render image container with correct className', () => {
			// Arrange
			const announcement = {
				title: 'Test Image Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const imageContainer = container.querySelector( '.announcement-body-media.announcement-body-image' );
			expect( imageContainer ).toBeTruthy();
		} );
	} );

	describe( 'Content Rendering', () => {
		test( 'should render title correctly', () => {
			// Arrange
			const announcement = {
				title: 'Test Announcement Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			expect( screen.getByText( 'Test Announcement Title' ) ).toBeTruthy();
		} );

		test( 'should render description with HTML content', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: '<p>Test <strong>description</strong> with HTML</p>',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const descriptionElement = container.querySelector( '.announcement-body-description' );
			expect( descriptionElement ).toBeTruthy();
			expect( descriptionElement.innerHTML ).toBe( '<p>Test <strong>description</strong> with HTML</p>' );
		} );
	} );

	describe( 'Container Structure', () => {
		test( 'should render main container with correct className', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const mainContainer = container.querySelector( '.announcement-body-container' );
			expect( mainContainer ).toBeTruthy();
		} );

		test( 'should render content section with correct className', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const contentSection = container.querySelector( '.announcement-body-content' );
			expect( contentSection ).toBeTruthy();
		} );
	} );

	describe( 'Edge Cases', () => {
		test( 'should render only content when media type is not image or video', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: 'Test description',
				media: {
					type: 'unknown',
					src: 'https://example.com/file.pdf',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const mediaContainer = container.querySelector( '.announcement-body-media' );
			expect( mediaContainer ).toBeFalsy();
			expect( screen.getByText( 'Test Title' ) ).toBeTruthy();
		} );

		test( 'should render empty title when title is empty string', () => {
			// Arrange
			const announcement = {
				title: '',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const titleElement = container.querySelector( '.announcement-body-title' );
			expect( titleElement ).toBeTruthy();
			expect( titleElement.textContent ).toBe( '' );
		} );

		test( 'should render empty description when description is empty string', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: '',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const descriptionElement = container.querySelector( '.announcement-body-description' );
			expect( descriptionElement ).toBeTruthy();
			expect( descriptionElement.innerHTML ).toBe( '' );
		} );

		test( 'should not render image when video type is specified', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: 'Test description',
				media: {
					type: 'video',
					src: 'https://www.youtube.com/embed/le72grP_Q6k',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const image = container.querySelector( 'img' );
			const iframe = container.querySelector( 'iframe' );
			expect( image ).toBeFalsy();
			expect( iframe ).toBeTruthy();
		} );

		test( 'should not render video when image type is specified', () => {
			// Arrange
			const announcement = {
				title: 'Test Title',
				description: 'Test description',
				media: {
					type: 'image',
					src: 'https://example.com/image.jpg',
				},
			};

			// Act
			const { container } = render( <AnnouncementBody announcement={ announcement } /> );

			// Assert
			const image = container.querySelector( 'img' );
			const iframe = container.querySelector( 'iframe' );
			expect( image ).toBeTruthy();
			expect( iframe ).toBeFalsy();
		} );
	} );
} );

