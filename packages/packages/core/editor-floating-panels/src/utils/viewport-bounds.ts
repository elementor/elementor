export const APP_BAR_HEIGHT_PX = 48;

const SIDE_PANEL_SELECTOR = '#elementor-panel';

export function getSidePanelInlineSize(): number {
	return document.querySelector< HTMLElement >( SIDE_PANEL_SELECTOR )?.getBoundingClientRect().width ?? 0;
}

export function getDockedMaxInlineSize( minInlineSize: number ): number {
	return Math.max( minInlineSize, window.innerWidth - getSidePanelInlineSize() );
}
