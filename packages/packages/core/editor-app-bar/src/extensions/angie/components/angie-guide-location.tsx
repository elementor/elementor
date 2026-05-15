import * as React from 'react';
import { useEffect, useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { ThemeProvider } from '@elementor/editor-ui';
import { useMixpanel } from '@elementor/events';
import { Infotip } from '@elementor/ui';

import {
	AI_WIDGET_CTA_VIEWED_EVENT,
	ANGIE_BUTTON_ARIA_LABEL,
	ANGIE_GUIDE_TOGGLE_EVENT,
	ANGIE_LEARN_MORE_URL,
	ANGIE_TOP_BAR_DESCRIPTION,
	ANGIE_TOP_BAR_PROMOTION_IMAGE_URL,
	CREATE_WIDGET_EVENT,
} from '../angie-consts';
import { AngieGuideCard } from '../components/angie-guide-card';
import { useAutoShow } from '../hooks/use-auto-show';

export function AngieGuideLocation() {
	useAutoShow();
	const [ anchorEl, setAnchorEl ] = useState< Element | null >( null );
	const { dispatchEvent } = useMixpanel();
	const { isAdmin } = useCurrentUserCapabilities();

	const isOpen = Boolean( anchorEl );

	useEffect( () => {
		const handleToggle = () => {
			setAnchorEl( ( prev ) => {
				if ( prev ) {
					return null;
				}

				return document.querySelector( `[aria-label="${ ANGIE_BUTTON_ARIA_LABEL }"]` );
			} );
		};

		window.addEventListener( ANGIE_GUIDE_TOGGLE_EVENT, handleToggle );

		return () => {
			window.removeEventListener( ANGIE_GUIDE_TOGGLE_EVENT, handleToggle );
		};
	}, [] );

	const handleClose = () => setAnchorEl( null );

	const handleInstall = async () => {
		dispatchEvent?.( AI_WIDGET_CTA_VIEWED_EVENT, {
			entry_point: 'top_bar_icon',
		} );
		window.dispatchEvent(
			new CustomEvent( CREATE_WIDGET_EVENT, {
				detail: {
					entry_point: 'top_bar_icon',
				},
			} )
		);
		handleClose();
	};

	return (
		<ThemeProvider>
			<Infotip
				content={
					<AngieGuideCard
						imageUrl={ ANGIE_TOP_BAR_PROMOTION_IMAGE_URL }
						description={ ANGIE_TOP_BAR_DESCRIPTION }
						learnMoreUrl={ ANGIE_LEARN_MORE_URL }
						onInstall={ isAdmin ? handleInstall : undefined }
						onClose={ handleClose }
					/>
				}
				placement="bottom-start"
				open={ isOpen }
				disableHoverListener={ true }
				PopperProps={ {
					anchorEl,
					modifiers: [
						{
							name: 'offset',
							options: { offset: [ -4, -4 ] },
						},
					],
				} }
			>
				<span />
			</Infotip>
		</ThemeProvider>
	);
}
