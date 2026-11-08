import { useEffect } from 'react';

export const DOCKED_BODY_CLASS = 'elementor-floating-panel-docked';
export const DOCKED_WIDTH_VAR = '--e-editor-docked-panel-width';

let dockedCount = 0;

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
