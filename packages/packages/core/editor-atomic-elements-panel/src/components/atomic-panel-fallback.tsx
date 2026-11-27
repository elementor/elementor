import { useEffect } from 'react';

import { setElementsPanelSelection } from '../elements-panel-selection';
import { disableLegacyHiding } from '../legacy-hiding/legacy-hiding-state';

type Props = {
	close: () => Promise< void >;
};

export function AtomicPanelFallback( { close }: Props ) {
	useEffect( () => {
		disableLegacyHiding();
		setElementsPanelSelection( 'non_atomic' );
		close();
	}, [ close ] );

	return null;
}
