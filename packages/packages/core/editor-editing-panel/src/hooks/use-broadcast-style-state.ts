import { useEffect } from 'react';
import { type StyleDefinitionState } from '@elementor/editor-styles';

import { useElement } from '../contexts/element-context';

export const STYLE_STATE_EVENT = 'elementor/editor/style-state/change';

function broadcast( id: string, state: StyleDefinitionState | null ) {
	window.dispatchEvent( new CustomEvent( STYLE_STATE_EVENT, { detail: { id, state } } ) );
}

export function useBroadcastStyleState( state: StyleDefinitionState | null ) {
	const { element } = useElement();

	useEffect( () => {
		broadcast( element.id, state );

		return () => broadcast( element.id, null );
	}, [ element.id, state ] );
}
