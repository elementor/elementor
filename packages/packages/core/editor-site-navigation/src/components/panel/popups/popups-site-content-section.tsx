import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { useContentPanelCoordinator } from '../../../contexts/content-panel-coordinator';
import { POPUPS_SITE_CONTENT_SECTION_ID } from '../../../popups/constants';
import SiteContentCollapsibleList from '../posts-list/collapsible-list';
import { PopupSectionAddButton, type PopupSectionAddButtonRef } from './popup-section-add-button';

export default function PopupsSiteContentSection() {
	const { registerSection, unregisterSection } = useContentPanelCoordinator();
	const [ isOpen, setIsOpen ] = useState( false );
	const sectionAddRef = useRef< PopupSectionAddButtonRef >( null );

	useEffect( () => {
		registerSection( POPUPS_SITE_CONTENT_SECTION_ID, {
			setExpanded: setIsOpen,
			startCreate: () => {
				sectionAddRef.current?.togglePromotion();
			},
		} );

		return () => unregisterSection( POPUPS_SITE_CONTENT_SECTION_ID );
	}, [ registerSection, unregisterSection ] );

	const sectionTitle = __( 'Popups', 'elementor' );

	return (
		<SiteContentCollapsibleList
			count={ 0 }
			isOpen={ isOpen }
			onOpenChange={ setIsOpen }
			title={ sectionTitle }
			trailingActions={
				<PopupSectionAddButton ref={ sectionAddRef } onCreate={ () => undefined } />
			}
		/>
	);
}
