import * as React from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { usePanelsInjections } from '../../location';
import { selectOpenId } from '../../store';
import Portal from './portal';

export default function Panels() {
	const injections = usePanelsInjections();
	const openId = useSelector( selectOpenId );

	const persistentInjections = injections.filter( ( injection ) => injection.keepMounted );
	const openInjection = injections.find( ( injection ) => openId === injection.id );

	if ( ! persistentInjections.length && ! openInjection ) {
		return null;
	}

	return (
		<Portal>
			{ persistentInjections.map( ( { id, component: Component } ) => (
				<div key={ id } style={ { display: openId === id ? 'contents' : 'none' } }>
					<Component />
				</div>
			) ) }
			{ openInjection && ! openInjection.keepMounted && <openInjection.component /> }
		</Portal>
	);
}
