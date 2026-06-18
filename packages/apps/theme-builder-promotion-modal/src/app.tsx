import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { TRIGGER_EVENT } from './constants';
import { PromotionAlert } from './components/promotion-alert';
import { PromotionModal } from './components/promotion-modal';
import type { OpenEventDetail } from './types';

export function App( { container }: { container?: HTMLElement } ) {
	const [ openDetail, setOpenDetail ] = useState<OpenEventDetail | null>( null );

	useEffect( () => {
		const onOpen = ( event: Event ) => {
			const customEvent = event as CustomEvent<OpenEventDetail>;
			const detail = customEvent?.detail;

			if ( !detail?.scenario || !detail?.introductionKey || ! detail?.mode ) {
				return;
			}

			setOpenDetail( detail );
		};

		document.addEventListener( TRIGGER_EVENT, onOpen );

		return () => {
			document.removeEventListener( TRIGGER_EVENT, onOpen );
		};
	}, [] );

	const handleClose = useCallback( () => setOpenDetail( null ), [] );

	if ( ! openDetail ) {
		return null;
	}

	if ( 'alert' === openDetail.mode ) {
		return <PromotionAlert scenario={ openDetail.scenario } onClose={ handleClose } />;
	}

	return (
		<PromotionModal
			container={ container }
			scenario={ openDetail.scenario }
			introductionKey={ openDetail.introductionKey }
			onClose={ handleClose }
		/>
	);
}

