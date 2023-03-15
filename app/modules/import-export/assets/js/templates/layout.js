import { useState, useEffect, useContext } from 'react';

import Page from 'elementor-app/layout/page';
import ContentLayout from '../shared/content-layout/content-layout';
import { infoButtonProps } from '../shared/info-modal/info-modal';
import ImportInfoModal from '../shared/info-modal/import-info-modal';
import ExportInfoModal from '../shared/info-modal/export-info-modal';
import { SharedContext } from '../context/shared-context/shared-context-provider';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

import useQueryParams from 'elementor-app/hooks/use-query-params';

export default function Layout( props ) {
	const [ showInfoModal, setShowInfoModal ] = useState( false ),
		{ referrer } = useQueryParams().getAll(),
		sharedContext = useContext( SharedContext ),
		{ currentPage } = sharedContext.data,
		eventTracking = ( command, elementPosition = null, element = null, eventType = 'click', modalType = null ) => {
			if ( 'kit-library' === sharedContext.data.referrer || referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						element,
						page_source: 'import',
						event_type: eventType,
						step: currentPage,
						element_position: elementPosition,
						modal_type: modalType,
					},
				);
			}
		},
		onModalClose = ( e, command ) => {
			const element = e.target.classList.contains( 'eps-modal__overlay' ) ? 'overlay' : 'x';
			eventTracking( command, element, null, 'info' );
		},
		getContent = () => {
			let infoModalProps = {
				show: showInfoModal,
				setShow: setShowInfoModal,
			};

			if ( 'kit-library' === sharedContext.data.referrer || referrer ) {
				infoModalProps = {
					referrer,
					...infoModalProps,
					onOpen: () => eventTracking( 'kit-library/modal-open', null, null, 'load', 'info' ),
					onClose: ( e ) => onModalClose( e, 'kit-library/modal-close' ),
				};
			}

			return (
				<ContentLayout>
					{ props.children }
					{ 'import' === props.type ? <ImportInfoModal { ...infoModalProps } /> : <ExportInfoModal { ...infoModalProps } /> }
				</ContentLayout>
			);
		},
		getInfoButtonProps = () => {
			return {
				...infoButtonProps,
				onClick: () => {
					eventTracking( 'kit-library/seek-more-info', 'app_header' );
					setShowInfoModal( true );
				},
			};
		},
		onClose = () => {
			eventTracking( 'kit-library/close', 'app_header', null, 'click' );
			window.top.location = elementorAppConfig.admin_url;
		},
		config = {
			title: 'import' === props.type ? __( 'Import', 'elementor' ) : __( 'Export', 'elementor' ),
			headerButtons: [ getInfoButtonProps(), ...props.headerButtons ],
			content: getContent(),
			footer: props.footer,
			onClose: () => onClose(),
		},
		moduleAdminTab = '#tab-import-export-kit';

	// Targeting the return_url value to the import-export dedicated admin tab (only when there is no specific referrer).
	if ( ! referrer && -1 === elementorAppConfig.return_url.indexOf( moduleAdminTab ) && elementorAppConfig.return_url.includes( 'page=elementor-tools' ) ) {
		elementorAppConfig.return_url += moduleAdminTab;
	}

	useEffect( () => {
		if ( referrer ) {
			sharedContext.dispatch( { type: 'SET_REFERRER', payload: referrer } );
		}
	}, [ referrer ] );

	return <Page { ...config } />;
}

Layout.propTypes = {
	type: PropTypes.oneOf( [ 'import', 'export' ] ),
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	children: PropTypes.object.isRequired,
	footer: PropTypes.object,
};

Layout.defaultProps = {
	headerButtons: [],
};
