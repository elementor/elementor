import { useEffect, useState } from 'react';

export const DOCKED_BODY_CLASS = 'elementor-floating-panel-docked';
export const DOCKED_WIDTH_VAR = '--e-editor-docked-panel-width';
export const NAVIGATOR_DOCKED_BODY_CLASS = 'elementor-navigator-docked';
export const NAVIGATOR_WIDTH_VAR = '--e-editor-navigator-width';

let dockedCount = 0;

export const getDockedPanelInsetInlineEnd = (): string => {
	if ( ! document.body.classList.contains( NAVIGATOR_DOCKED_BODY_CLASS ) ) {
		return '0';
	}

	return `var(${ NAVIGATOR_WIDTH_VAR }, 0px)`;
};

export function useDockedPanelInsetInlineEnd( active: boolean ): string {
	const [ insetInlineEnd, setInsetInlineEnd ] = useState( getDockedPanelInsetInlineEnd );

	useEffect( () => {
		if ( ! active ) {
			return;
		}

		const syncInset = () => {
			setInsetInlineEnd( getDockedPanelInsetInlineEnd() );
		};

		syncInset();

		const observer = new MutationObserver( syncInset );
		observer.observe( document.body, { attributes: true, attributeFilter: [ 'class' ] } );

		return () => observer.disconnect();
	}, [ active ] );

	return insetInlineEnd;
}

export function useDockedLayout( active: boolean, width: number ) {
	useEffect( () => {
		if ( ! active ) {
			return;
		}

		const { body } = document;

		dockedCount += 1;
		body.classList.add( DOCKED_BODY_CLASS );
		body.style.setProperty( DOCKED_WIDTH_VAR, `${ width }px` );

		return () => {
			dockedCount = Math.max( 0, dockedCount - 1 );

			if ( dockedCount > 0 ) {
				return;
			}

			body.classList.remove( DOCKED_BODY_CLASS );
			body.style.removeProperty( DOCKED_WIDTH_VAR );
		};
	}, [ active, width ] );
}
