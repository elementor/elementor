import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { PromotionModal } from './components/promotion-modal';
import { TRIGGER_EVENT } from './constants';
import type { OpenEventDetail } from './types';
import { markIntroductionViewed } from './utils/mark-introduction-viewed';

export const App = ( { container }: { container?: HTMLElement } ) => {
	const [ openDetail, setOpenDetail ] = useState< OpenEventDetail | null >( null );

	useEffect( () => {
		const onOpen = ( event: Event ) => {
			const customEvent = event as CustomEvent< OpenEventDetail >;
			const detail = customEvent?.detail;
			const { scenario, introductionKey, assets } = detail ?? {};

			if ( ! scenario || ! introductionKey || ! assets ) {
				return;
			}

			setOpenDetail( detail );
		};

		document.addEventListener( TRIGGER_EVENT, onOpen );

		return () => {
			document.removeEventListener( TRIGGER_EVENT, onOpen );
		};
	}, [] );

	const handleClose = useCallback( () => {
		if ( openDetail?.introductionKey ) {
			void markIntroductionViewed( openDetail.introductionKey );
		}

		setOpenDetail( null );
	}, [ openDetail ] );

	if ( ! openDetail ) {
		return null;
	}

	return (
		<PromotionModal
			container={ container }
			scenario={ openDetail.scenario }
			assets={ openDetail.assets }
			onClose={ handleClose }
		/>
	);
};
