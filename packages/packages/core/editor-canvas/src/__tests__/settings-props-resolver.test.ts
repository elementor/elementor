import { createMockStyleDefinition, createMockStylesProvider } from 'test-utils';
import {
	booleanPropTypeUtil,
	classesPropTypeUtil,
	imageAttachmentIdPropType,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	linkPropTypeUtil,
	numberPropTypeUtil,
	type Props,
	type PropsSchema,
	stringPropTypeUtil,
	urlPropTypeUtil,
} from '@elementor/editor-props';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { getMediaAttachment } from '@elementor/wp-media';

import { initSettingsTransformers } from '../init-settings-transformers';
import { createPropsResolver } from '../renderers/create-props-resolver';
import { settingsTransformersRegistry } from '../settings-transformers-registry';
import { mockAttachmentData } from './mock-attachment-data';
import {
	booleanPropType,
	classesPropType,
	imagePropType,
	linkPropType,
	numberPropType,
	stringPropType,
	urlPropType,
} from './prop-types';

jest.mock( '@elementor/wp-media' );

jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	stylesRepository: {
		getProviders: jest.fn( () => [] ),
	},
} ) );

type Payload = {
	name: string;
	prepare?: () => void;
	props: Props;
	schema: PropsSchema;
	expected: Record< string, unknown >;
};

describe( 'settings props resolver', () => {
	it.each< Payload >( [
		{
			name: 'plain props',
			props: {
				string: stringPropTypeUtil.create( 'test' ),
				url: urlPropTypeUtil.create( 'url' ),
				number: numberPropTypeUtil.create( 123 ),
				boolean: booleanPropTypeUtil.create( true ),
			},
			schema: {
				string: stringPropType(),
				number: numberPropType(),
				boolean: booleanPropType(),
				url: urlPropType(),
			},
			expected: {
				string: 'test',
				url: 'url',
				number: 123,
				boolean: true,
			},
		},
		{
			name: 'classes',
			props: {
				classes: classesPropTypeUtil.create( [
					'test-1',
					'test-2-suffix',
					'without-provider',
					'',
					null as unknown as string,
					undefined as unknown as string,
				] ),
			},
			prepare: () => {
				jest.mocked( stylesRepository.getProviders ).mockReturnValue( [
					createMockStylesProvider( {
						key: 'test-1-provider',
						actions: {
							all: () => [ createMockStyleDefinition( { id: 'test-1' } ) ],
						},
					} ),
					createMockStylesProvider( {
						key: 'test-2-provider',
						actions: {
							resolveCssName: ( id ) => `${ id }-suffix`,
							all: () => [ createMockStyleDefinition( { id: 'test-2' } ) ],
						},
					} ),
				] );
			},
			schema: {
				classes: classesPropType(),
			},
			expected: {
				classes: [ 'test-1', 'test-2-suffix', 'without-provider' ],
			},
		},
		{
			name: 'link',
			props: {
				link1: linkPropTypeUtil.create( {
					destination: 'https://elementor.com/blank',
					isTargetBlank: true,
				} ),
				link2: linkPropTypeUtil.create( {
					destination: 'https://elementor.com/self',
					isTargetBlank: false,
				} ),
			},
			schema: {
				link1: linkPropType(),
				link2: linkPropType(),
			},
			expected: {
				link1: { href: 'https://elementor.com/blank', target: '_blank' },
				link2: { href: 'https://elementor.com/self', target: '_self' },
			},
		},
		{
			name: 'image (url)',
			props: {
				image: imagePropTypeUtil.create( {
					src: imageSrcPropTypeUtil.create( {
						id: null,
						url: urlPropTypeUtil.create( 'https://localhost.test/test-image.png' ),
					} ),
					size: stringPropTypeUtil.create( 'full' ),
				} ),
			},
			schema: {
				image: imagePropType(),
			},
			expected: {
				image: {
					src: 'https://localhost.test/test-image.png',
				},
			},
		},
		{
			name: 'image (attachment with size)',
			prepare: () => {
				jest.mocked( getMediaAttachment ).mockImplementation(
					( args ) => Promise.resolve( mockAttachmentData( args.id ) ) as never
				);
			},
			props: {
				image: imagePropTypeUtil.create( {
					src: imageSrcPropTypeUtil.create( {
						id: imageAttachmentIdPropType.create( 123 ),
						url: null,
					} ),
					size: stringPropTypeUtil.create( 'large' ),
				} ),
			},
			schema: {
				image: imagePropType(),
			},
			expected: {
				image: {
					src: 'large-image-url-123',
					height: 3,
					width: 3,
				},
			},
		},
		{
			name: 'image (attachment with non existing size)',
			prepare: () => {
				jest.mocked( getMediaAttachment ).mockImplementation(
					( args ) => Promise.resolve( mockAttachmentData( args.id ) ) as never
				);
			},
			props: {
				image: imagePropTypeUtil.create( {
					src: imageSrcPropTypeUtil.create( {
						id: imageAttachmentIdPropType.create( 123 ),
						url: null,
					} ),
					size: stringPropTypeUtil.create( 'non-existing-size' ),
				} ),
			},
			schema: {
				image: imagePropType(),
			},
			expected: {
				image: {
					src: 'original-image-url-123',
					height: 0,
					width: 0,
				},
			},
		},
	] )( 'it should resolve props for `$name`', async ( { prepare, props, expected, schema } ) => {
		// Arrange.
		prepare?.();

		initSettingsTransformers();

		const resolve = createPropsResolver( {
			transformers: settingsTransformersRegistry,
			schema,
		} );

		// Act.
		const result = await resolve( { props } );

		// Assert.
		expect( result ).toStrictEqual( expected );
	} );
} );
