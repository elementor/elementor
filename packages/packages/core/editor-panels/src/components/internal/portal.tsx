import * as React from 'react';
import { useEffect, useState } from 'react';
import { Portal as BasePortal, type PortalProps } from '@elementor/ui';

import { getPortalContainer } from '../../sync';

type Props = Omit< PortalProps, 'container' >;

export default function Portal( props: Props ) {
	const [ container, setContainer ] = useState( () => getPortalContainer() );

	useEffect( () => {
		if ( container ) {
			return;
		}

		const resolveContainer = () => {
			const portalContainer = getPortalContainer();

			if ( portalContainer ) {
				setContainer( portalContainer );
			}
		};

		window.addEventListener( 'elementor/panel/init', resolveContainer );
		resolveContainer();

		return () => {
			window.removeEventListener( 'elementor/panel/init', resolveContainer );
		};
	}, [ container ] );

	if ( ! container ) {
		return null;
	}

	return <BasePortal container={ container } { ...props } />;
}
