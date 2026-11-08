import {
	DOCKED_WIDTH_VAR,
	NAVIGATOR_DOCKED_BODY_CLASS,
	NAVIGATOR_WIDTH_VAR,
} from '../hooks/use-docked-layout';

export const APP_BAR_HEIGHT_PX = 48;

const SIDE_PANEL_SELECTOR = '#elementor-panel';

export function getSidePanelInlineSize(): number {
	return document.querySelector< HTMLElement >( SIDE_PANEL_SELECTOR )?.getBoundingClientRect().width ?? 0;
}

function readBodyCssVarPx( cssVarName: string ): number {
	const { body } = document;
	const raw = body.style.getPropertyValue( cssVarName ) || getComputedStyle( body ).getPropertyValue( cssVarName );
	const parsed = parseFloat( raw );

	return Number.isFinite( parsed ) ? parsed : 0;
}

export function getInlineEndDockedInsetPx(): number {
	let inset = 0;

	if ( document.body.classList.contains( NAVIGATOR_DOCKED_BODY_CLASS ) ) {
		inset += readBodyCssVarPx( NAVIGATOR_WIDTH_VAR );
	}

	inset += readBodyCssVarPx( DOCKED_WIDTH_VAR );

	return inset;
}

export function getDockedMaxInlineSize( minInlineSize: number ): number {
	const navigatorWidth = document.body.classList.contains( NAVIGATOR_DOCKED_BODY_CLASS )
		? readBodyCssVarPx( NAVIGATOR_WIDTH_VAR )
		: 0;
	const available = window.innerWidth - getSidePanelInlineSize() - navigatorWidth;

	return Math.max( minInlineSize, available );
}
