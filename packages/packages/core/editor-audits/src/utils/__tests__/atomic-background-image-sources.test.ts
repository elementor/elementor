import { getElementStyles } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';

import { type ElementSnapshotNode } from '../../types';
import { walkAtomicBackgroundImageSources } from '../atomic-background-image-sources';

jest.mock( '@elementor/editor-elements', () => ( {
	getElementStyles: jest.fn(),
} ) );

const getElementStylesMock = jest.mocked( getElementStyles );

const atomicImageProp = ( id: number, size = 'full' ) => ( {
	$$type: 'image',
	value: {
		src: {
			$$type: 'image-src',
			value: { id: { $$type: 'image-attachment-id', value: id }, url: null },
		},
		size: { $$type: 'string', value: size },
	},
} );

const backgroundStyleWithImageOverlay = ( id: number, size = 'full' ): Record< string, StyleDefinition > => ( {
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
										value: { image: atomicImageProp( id, size ) },
									},
								],
							},
						},
					},
				},
			},
		],
	},
} );

describe( 'walkAtomicBackgroundImageSources', () => {
	beforeEach( () => {
		getElementStylesMock.mockReturnValue( null );
	} );

	it( 'yields the image inside a background-image-overlay layer', () => {
		const tree: ElementSnapshotNode[] = [
			{ id: 'container', elType: 'container', widgetType: undefined, settings: {}, elements: [] },
		];

		getElementStylesMock.mockImplementation( ( elementId ) =>
			elementId === 'container' ? backgroundStyleWithImageOverlay( 1, 'medium' ) : null
		);

		const sources: Array< { nodeId: string; mediaId?: number; size?: string } > = [];
		walkAtomicBackgroundImageSources( tree, ( { node, media } ) => {
			sources.push( { nodeId: node.id, mediaId: media.id, size: media.size } );
		} );

		expect( sources ).toEqual( [ { nodeId: 'container', mediaId: 1, size: 'medium' } ] );
	} );

	it( 'yields images from every hover/state variant of the style', () => {
		const tree: ElementSnapshotNode[] = [
			{ id: 'container', elType: 'container', widgetType: undefined, settings: {}, elements: [] },
		];

		const base = backgroundStyleWithImageOverlay( 1 );
		const hover = backgroundStyleWithImageOverlay( 2 );
		base.local.variants.push( { ...hover.local.variants[ 0 ], meta: { breakpoint: null, state: 'hover' } } );

		getElementStylesMock.mockImplementation( ( elementId ) => ( elementId === 'container' ? base : null ) );

		const mediaIds: Array< number | undefined > = [];
		walkAtomicBackgroundImageSources( tree, ( { media } ) => mediaIds.push( media.id ) );

		expect( mediaIds.sort() ).toEqual( [ 1, 2 ] );
	} );

	it( 'ignores elements without live styles', () => {
		const tree: ElementSnapshotNode[] = [
			{ id: 'no-styles', elType: 'container', widgetType: undefined, settings: {}, elements: [] },
		];

		let count = 0;
		walkAtomicBackgroundImageSources( tree, () => count++ );

		expect( count ).toBe( 0 );
	} );
} );
