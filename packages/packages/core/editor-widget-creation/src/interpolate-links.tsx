import * as React from 'react';
import { Link } from '@elementor/ui';

type LinkConfig = {
	label: string;
	href: string;
};

type LinksMap = Record< string, LinkConfig >;

const LINK_PLACEHOLDER_PATTERN = /\{\{(\w+)}}/g;

export const interpolateLinks = ( text: string, links: LinksMap ) => {
	return text.split( LINK_PLACEHOLDER_PATTERN ).map( ( part, i ) => {
		const link = links[ part ];

		if ( ! link ) {
			return part;
		}

		return (
			<Link key={ i } sx={ { px: 0.5 } } href={ link.href } target="_blank" rel="noopener noreferrer">
				{ link.label }
			</Link>
		);
	} );
};
