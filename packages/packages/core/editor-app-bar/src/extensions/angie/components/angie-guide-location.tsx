import * as React from 'react';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { Infotip } from '@elementor/ui';

import {
	ANGIE_BUTTON_ARIA_LABEL,
	ANGIE_GUIDE_TOGGLE_EVENT,
	ANGIE_LEARN_MORE_URL,
	ANGIE_TOP_BAR_DESCRIPTION,
	ANGIE_TOP_BAR_PROMOTION_IMAGE_URL,
} from '../angie-consts';
import { AngieGuideCard } from '../components/angie-guide-card';

export function AngieGuideLocation() {
	const [ anchorEl, setAnchorEl ] = useState< Element | null >( null );

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

	return (
		<ThemeProvider>
			<Infotip
				content={
					<AngieGuideCard
						imageUrl={ ANGIE_TOP_BAR_PROMOTION_IMAGE_URL }
						description={ ANGIE_TOP_BAR_DESCRIPTION }
						learnMoreUrl={ ANGIE_LEARN_MORE_URL }
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
				<span style={ { display: 'contents' } } />
			</Infotip>
		</ThemeProvider>
	);
}
