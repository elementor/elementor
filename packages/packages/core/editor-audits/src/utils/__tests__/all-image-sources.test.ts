import { getElementStyles } from '@elementor/editor-elements';

import { makeContainer, makeWidget } from '../../audits/__tests__/fixtures';
import { walkAllImageSources } from '../all-image-sources';

jest.mock( '@elementor/editor-elements', () => ( {
	getElementStyles: jest.fn(),
} ) );

const getElementStylesMock = jest.mocked( getElementStyles );

const atomicImageProp = ( id: number ) => ( {
	$$type: 'image',
	value: {
		src: {
			$$type: 'image-src',
			value: { id: { $$type: 'image-attachment-id', value: id }, url: null },
		},
		size: null,
	},
} );

describe( 'walkAllImageSources', () => {
	it( 'visits image widgets, backgrounds, atomic images and atomic background layers', () => {
		// Arrange
		const tree = [
			makeWidget( 'v3', 'image', { image: { id: 1 } } ),
			makeContainer( 'container', { background_image: { id: 2 } } ),
			makeWidget( 'v4', 'e-image', { image: atomicImageProp( 3 ) } ),
			makeWidget( 'video', 'e-self-hosted-video', { poster: atomicImageProp( 4 ) } ),
			makeWidget( 'div', 'e-div-block', {} ),
		];

		getElementStylesMock.mockImplementation( ( elementId ) =>
			elementId === 'div'
				? {
						local: {
							id: 'local',
							label: 'local',
							type: 'class',
							variants: [
								{
									meta: { breakpoint: null, state: null },
									custom_css: null,
									props: {
										background: {
											$$type: 'background',
											value: {
												color: null,
												clip: null,
												'background-overlay': {
													$$type: 'background-overlay',
													value: [
														{
															$$type: 'background-image-overlay',
															value: { image: atomicImageProp( 5 ) },
														},
													],
												},
											},
										},
									},
								},
							],
						},
				  }
				: null
		);

		const visited: Array< { nodeId: string; mediaId?: number } > = [];

		// Act
		walkAllImageSources( tree, ( { node, media } ) => visited.push( { nodeId: node.id, mediaId: media.id } ) );

		// Assert
		expect( visited ).toEqual( [
			{ nodeId: 'v3', mediaId: 1 },
			{ nodeId: 'container', mediaId: 2 },
			{ nodeId: 'v4', mediaId: 3 },
			{ nodeId: 'video', mediaId: 4 },
			{ nodeId: 'div', mediaId: 5 },
		] );
	} );
} );
