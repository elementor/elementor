import {
	getAnchorId,
	isCurrentPageLink,
} from 'elementor/modules/atomic-widgets/elements/atomic-menu/handlers/url-matcher';

describe( 'url-matcher', () => {
	describe( 'isCurrentPageLink', () => {
		it.each( [
			[ 'same url', 'https://example.com/about/', 'https://example.com/about/', true ],
			[ 'missing trailing slash on the link', 'https://example.com/about', 'https://example.com/about/', true ],
			[ 'missing trailing slash on the page', 'https://example.com/about/', 'https://example.com/about', true ],
			[ 'http link on an https page', 'http://example.com/about/', 'https://example.com/about/', true ],
			[ 'www link on a bare host page', 'https://www.example.com/about/', 'https://example.com/about/', true ],
			[ 'bare host link on a www page', 'https://example.com/about/', 'https://www.example.com/about/', true ],
			[ 'relative link', '/about/', 'https://example.com/about/', true ],
			[ 'link with an empty hash', 'https://example.com/about/#', 'https://example.com/about/', true ],
			[ 'matching query string', 'https://example.com/about/?ref=x', 'https://example.com/about/?ref=x', true ],
			[ 'query string only on the page', 'https://example.com/about/', 'https://example.com/about/?ref=x', false ],
			[ 'query string only on the link', 'https://example.com/about/?ref=x', 'https://example.com/about/', false ],
			[ 'different query string', 'https://example.com/?page_id=5', 'https://example.com/?page_id=6', false ],
			[ 'same page_id query', 'https://example.com/?page_id=5', 'https://example.com/?page_id=5', true ],
			[ 'home link on the site root', 'https://example.com/', 'https://example.com/', true ],
			[ 'home link on an inner page', 'https://example.com/', 'https://example.com/about/', false ],
			[ 'home link without slash on the site root', 'https://example.com', 'https://example.com/', true ],
			[ 'inner link on the site root', 'https://example.com/about/', 'https://example.com/', false ],
			[ 'parent path is not current', 'https://example.com/products/', 'https://example.com/products/shoes/', false ],
			[ 'subdirectory install', 'https://example.com/blog/about/', 'https://example.com/blog/about/', true ],
			[ 'subdirectory home on its root', 'https://example.com/blog/', 'https://example.com/blog/', true ],
			[ 'subdirectory home on an inner page', 'https://example.com/blog/', 'https://example.com/blog/about/', false ],
			[ 'external domain', 'https://other.com/about/', 'https://example.com/about/', false ],
			[ 'link with a hash is not a page link', 'https://example.com/about/#team', 'https://example.com/about/', false ],
			[ 'empty href', '', 'https://example.com/about/', false ],
			[ 'null href', null, 'https://example.com/about/', false ],
			[ 'mailto link', 'mailto:hi@example.com', 'https://example.com/about/', false ],
			[ 'javascript link', 'javascript:void(0)', 'https://example.com/about/', false ],
		] )( '%s', ( _, href, pageUrl, expected ) => {
			expect( isCurrentPageLink( href, pageUrl ) ).toBe( expected );
		} );
	} );

	describe( 'getAnchorId', () => {
		it.each( [
			[ 'hash only link', '#contact', 'https://example.com/', 'contact' ],
			[ 'same page link with a hash', 'https://example.com/#contact', 'https://example.com/', 'contact' ],
			[ 'same page, missing trailing slash', 'https://example.com/about#team', 'https://example.com/about/', 'team' ],
			[ 'non-ASCII hash is decoded', '#%D7%A6%D7%95%D7%A8-%D7%A7%D7%A9%D7%A8', 'https://example.com/', 'צור-קשר' ],
			[ 'malformed escape is kept as is', '#100%', 'https://example.com/', '100%' ],
			[ 'link to another page with a hash', 'https://example.com/other/#contact', 'https://example.com/', null ],
			[ 'external link with a hash', 'https://other.com/#contact', 'https://example.com/', null ],
			[ 'same path with a different query', 'https://example.com/?a=1#contact', 'https://example.com/', null ],
			[ 'no hash', 'https://example.com/', 'https://example.com/', null ],
			[ 'empty hash', '#', 'https://example.com/', null ],
			[ 'empty href', '', 'https://example.com/', null ],
		] )( '%s', ( _, href, pageUrl, expected ) => {
			expect( getAnchorId( href, pageUrl ) ).toBe( expected );
		} );
	} );
} );
