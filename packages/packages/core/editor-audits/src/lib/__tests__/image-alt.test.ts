import { hasMeaningfulAlt } from '../image-alt';
import { type PageContextResponse } from '../../types';

const PAGE_CONTEXT: PageContextResponse = {
	site_identity: {
		site_name_set: true,
		site_description_set: true,
		site_logo_set: true,
		site_favicon_set: true,
	},
	kit_id: 1,
	kit_is_default_unchanged: false,
	post_title: null,
	post_excerpt: null,
	featured_image_id: null,
	image_sizes: {
		1: {
			width: 100,
			height: 100,
			filesize_bytes: 1000,
			mime: 'image/jpeg',
			src: 'http://example.test/1.jpg',
			alt: 'From library',
		},
	},
	is_noindex: false,
	reading_settings_url: 'https://example.com/wp-admin/options-reading.php',
	privacy_policy_url: null,
	privacy_settings_url: 'https://example.com/wp-admin/options-privacy.php',
	ally_plugin_active: false,
	ally_plugin_url: '',
	cookiez_plugin_active: false,
	cookiez_plugin_url: '',
};

describe( 'hasMeaningfulAlt', () => {
	it( 'returns true for library attachment with alt in page context', () => {
		expect( hasMeaningfulAlt( { id: 1 }, PAGE_CONTEXT ) ).toBe( true );
	} );

	it( 'returns false for library attachment without alt in page context', () => {
		expect( hasMeaningfulAlt( { id: 99 }, PAGE_CONTEXT ) ).toBe( false );
	} );

	it( 'uses snapshot alt for URL-only images', () => {
		expect( hasMeaningfulAlt( { url: 'http://example.test/x.jpg', alt: 'External' }, PAGE_CONTEXT ) ).toBe( true );
		expect( hasMeaningfulAlt( { url: 'http://example.test/x.jpg' }, PAGE_CONTEXT ) ).toBe( false );
	} );

	it( 'ignores snapshot alt when attachment id is set', () => {
		expect( hasMeaningfulAlt( { id: 99, alt: 'Ignored' }, PAGE_CONTEXT ) ).toBe( false );
	} );
} );
