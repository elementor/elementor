import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import { TOPBAR_HEIGHT } from './base-layout';

const TopBarRoot = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	top: 0,
	left: 0,
	right: 0,
	height: TOPBAR_HEIGHT,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	paddingInlineStart: 41,
	paddingInlineEnd: 16,
	background: theme.palette.background.paper,
	boxShadow: theme.shadows[ 1 ],
	zIndex: theme.zIndex?.appBar || 1100,
} ) );

interface TopBarProps {
	children?: ReactNode;
}

export function TopBar( { children }: TopBarProps ) {
	return <TopBarRoot component="header">{ children }</TopBarRoot>;
}
