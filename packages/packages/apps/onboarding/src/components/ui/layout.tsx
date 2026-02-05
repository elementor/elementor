import * as React from 'react';
import type { ReactNode } from 'react';
import { Box, styled } from '@elementor/ui';

import { Footer } from './footer';
import { Header } from './header';

const HEADER_HEIGHT = 40;
const FOOTER_HEIGHT = 72;

const LayoutContainer = styled( Box )( ( { theme } ) => ( {
	position: 'fixed',
	inset: 0,
	display: 'flex',
	flexDirection: 'column',
	background: theme.palette.background.default,
	zIndex: theme.zIndex?.modal || 1300,
} ) );

interface ContentAreaProps {
	hasHeader: boolean;
	hasFooter: boolean;
}

const ContentArea = styled( Box, {
	shouldForwardProp: ( prop ) => ! [ 'hasHeader', 'hasFooter' ].includes( prop as string ),
} )< ContentAreaProps >( ( { hasHeader, hasFooter } ) => ( {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	overflow: 'auto',
	paddingTop: hasHeader ? HEADER_HEIGHT : 0,
	paddingBottom: hasFooter ? FOOTER_HEIGHT : 0,
} ) );

interface HeaderProps {
	showCloseButton?: boolean;
	showUpgradeButton?: boolean;
	onUpgrade?: () => void;
}

interface FooterProps {
	showBack?: boolean;
	showSkip?: boolean;
	showContinue?: boolean;
	backLabel?: string;
	skipLabel?: string;
	continueLabel?: string;
	continueDisabled?: boolean;
	continueLoading?: boolean;
	onBack?: () => void;
	onSkip?: () => void;
	onContinue?: () => void;
}

interface LayoutProps {
	children: ReactNode;
	showHeader?: boolean;
	showFooter?: boolean;
	onClose?: () => void;
	headerProps?: HeaderProps;
	footerProps?: FooterProps;
}

export function Layout( {
	children,
	showHeader = true,
	showFooter = true,
	onClose,
	headerProps = {},
	footerProps = {},
}: LayoutProps ) {
	return (
		<LayoutContainer>
			{ showHeader && <Header onClose={ onClose } { ...headerProps } /> }

			<ContentArea hasHeader={ showHeader } hasFooter={ showFooter }>
				{ children }
			</ContentArea>

			{ showFooter && <Footer { ...footerProps } /> }
		</LayoutContainer>
	);
}
