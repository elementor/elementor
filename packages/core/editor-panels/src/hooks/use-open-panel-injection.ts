import { useMemo } from 'react';
import { __useSelector as useSelector } from '@elementor/store';

import { usePanelsInjections } from '../location';
import { selectOpenId } from '../store';

export default function useOpenPanelInjection() {
	const injections = usePanelsInjections();
	const openId = useSelector( selectOpenId );

	return useMemo( () => injections.find( ( injection ) => openId === injection.id ), [ injections, openId ] );
}
