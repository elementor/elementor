import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import { FOOTER_HEIGHT } from './base-layout';

const FooterRoot = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	bottom: 0,
	left: 0,
	right: 0,
	height: FOOTER_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	padding: theme.spacing( 2, 3 ),
	background: theme.palette.background.paper,
	boxShadow: theme.shadows[ 4 ],
	zIndex: theme.zIndex?.appBar || 1100,
} ) );

interface FooterProps {
	children?: ReactNode;
}

export function Footer( { children }: FooterProps ) {
	return <FooterRoot component="footer">{ children }</FooterRoot>;
}
