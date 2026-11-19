import { useEffect } from 'react';

import { setElementsPanelSelection } from '../elements-panel-selection';

type Props = {
	close: () => Promise< void >;
};

export function AtomicPanelFallback( { close }: Props ) {
	useEffect( () => {
		setElementsPanelSelection( 'non_atomic' );
		close();
	}, [ close ] );

	return null;
}
