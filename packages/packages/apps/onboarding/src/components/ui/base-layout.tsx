import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

const TOPBAR_HEIGHT = 40;
const FOOTER_HEIGHT = 72;

const LayoutRoot = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	inset: 0,
	display: 'flex',
	flexDirection: 'column',
	background: theme.palette.background.default,
	zIndex: theme.zIndex?.modal || 1300,
} ) );

interface ContentAreaProps {
	topBarHeight: number;
	footerHeight: number;
}

const ContentArea = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'topBarHeight', 'footerHeight' ].includes( prop as string ),
} )< ContentAreaProps >( ( { topBarHeight, footerHeight } ) => ( {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	overflow: 'auto',
	paddingTop: topBarHeight,
	paddingBottom: footerHeight,
} ) );

interface BaseLayoutProps {
	children: ReactNode;
	topBar?: ReactNode;
	footer?: ReactNode;
	testId?: string;
}

export function BaseLayout( { children, topBar, footer, testId }: BaseLayoutProps ) {
	const topBarHeight = topBar ? TOPBAR_HEIGHT : 0;
	const footerHeight = footer ? FOOTER_HEIGHT : 0;

	return (
		<LayoutRoot data-testid={ testId }>
			{ topBar }
			<ContentArea topBarHeight={ topBarHeight } footerHeight={ footerHeight }>
				{ children }
			</ContentArea>
			{ footer }
		</LayoutRoot>
	);
}

export { TOPBAR_HEIGHT, FOOTER_HEIGHT };
