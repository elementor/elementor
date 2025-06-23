import * as React from 'react';
import { useRef } from 'react';
import { Portal as BasePortal, type PortalProps } from '@elementor/ui';

import { getPortalContainer } from '../../sync';

type Props = Omit< PortalProps, 'container' >;

export default function Portal( props: Props ) {
	const containerRef = useRef( getPortalContainer );

	if ( ! containerRef.current ) {
		return null;
	}

	return <BasePortal container={ containerRef.current } { ...props } />;
}
