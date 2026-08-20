import { readFileSync } from 'fs';
import { join } from 'path';

import { computeHtmlTag } from '../compute-html-tag';

type HtmlTagComputerCase = {
	settings: Record< string, unknown >;
	default: string;
	followLink: boolean;
	expected: string;
};

const contractCases: HtmlTagComputerCase[] = JSON.parse(
	readFileSync( join( __dirname, 'fixtures/html-tag-computer-cases.json' ), 'utf8' )
);

describe( 'computeHtmlTag', () => {
	it.each( contractCases )(
		'contract case: default=$default followLink=$followLink expected=$expected',
		( { settings, default: defaultTag, followLink, expected } ) => {
			expect(
				computeHtmlTag( settings, defaultTag, { followLink } )
			).toBe( expected );
		}
	);

	it( 'uses link tag when href is present', () => {
		expect(
			computeHtmlTag(
				{
					tag: 'div',
					link: {
						href: 'https://example.com',
						tag: 'a',
					},
				},
				'div'
			)
		).toBe( 'a' );
	});

	it( 'ignores link when followLink is false', () => {
		expect(
			computeHtmlTag(
				{
					tag: 'h4',
					link: {
						href: 'https://example.com',
						tag: 'a',
					},
				},
				'h2',
				{ followLink: false }
			)
		).toBe( 'h4' );
	} );
} );
