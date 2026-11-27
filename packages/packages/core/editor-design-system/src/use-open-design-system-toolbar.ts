import { type ToggleActionProps } from '@elementor/editor-app-bar';
import { DropletHalfFilledIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import { usePanelStatus } from './design-system-panel';
import { trackDesignSystem } from './import/tracking';
import { type DesignSystemTab, getActiveDesignSystemView } from './initial-tab';

const EVENT_TOGGLE = 'elementor/toggle-design-system';

type ToggleDetail = { home?: true; tab?: DesignSystemTab };

function getToolbarToggleDetail(
	panelOpen: boolean,
	view: ReturnType< typeof getActiveDesignSystemView >
): ToggleDetail {
	if ( ! panelOpen ) {
		return { home: true };
	}

	return view ? { tab: view } : { home: true };
}

export function useOpenDesignSystemToolbar(): ToggleActionProps {
	const { isOpen } = usePanelStatus();

	return {
		title: __( 'Design System', 'elementor' ),
		icon: DropletHalfFilledIcon,
		onClick: () => {
			if ( ! isOpen ) {
				trackDesignSystem( { event: 'opened' } );
			}

			const detail = getToolbarToggleDetail( isOpen, getActiveDesignSystemView() );

			window.dispatchEvent( new CustomEvent( EVENT_TOGGLE, { detail } ) );
		},
		selected: isOpen,
	};
}
