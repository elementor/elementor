import { useEffect, useRef } from 'react';

import { usePanelActions, usePanelStatus } from '../design-system-panel';
import { type DesignSystemTab, getActiveDesignSystemTab } from '../initial-tab';

const EVENT_TOGGLE = 'elementor/toggle-design-system';
const EVENT_SET_TAB = 'elementor/design-system/set-tab';
const EVENT_OPEN_VARIABLES = 'elementor/open-variables-manager';
const EVENT_OPEN_CLASSES = 'elementor/open-global-classes-manager';

/**
 * Entry points (style-tab class button, variables manager gear, etc.) dispatch
 * {@link EVENT_TOGGLE} with `detail: { tab }`. Same tab while open closes the panel;
 * another tab switches tab; while closed, delegates to the existing open-from-event flow.
 */
export function ToggleDesignSystemFromEntry() {
	const { close } = usePanelActions();
	const { isOpen } = usePanelStatus();
	const isOpenRef = useRef( isOpen );

	useEffect( () => {
		isOpenRef.current = isOpen;
	}, [ isOpen ] );

	useEffect( () => {
		const handler = ( event: Event ) => {
			const tab = ( event as CustomEvent< { tab: DesignSystemTab } > ).detail?.tab;
			if ( tab !== 'variables' && tab !== 'classes' ) {
				return;
			}

			if ( isOpenRef.current && getActiveDesignSystemTab() === tab ) {
				void close();
				return;
			}

			if ( isOpenRef.current ) {
				window.dispatchEvent( new CustomEvent( EVENT_SET_TAB, { detail: { tab } } ) );
				return;
			}

			window.dispatchEvent(
				new CustomEvent( tab === 'variables' ? EVENT_OPEN_VARIABLES : EVENT_OPEN_CLASSES )
			);
		};

		window.addEventListener( EVENT_TOGGLE, handler as EventListener );

		return () => {
			window.removeEventListener( EVENT_TOGGLE, handler as EventListener );
		};
	}, [ close ] );

	return null;
}
