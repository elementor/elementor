import { useState, useContext, useEffect } from 'react';

import Page from 'elementor-app/layout/page';
import ContentLayout from '../shared/content-layout/content-layout';
import { infoButtonProps } from '../shared/info-modal/info-modal';
import ImportInfoModal from '../shared/info-modal/import-info-modal';
import ExportInfoModal from '../shared/info-modal/export-info-modal';
import { SharedContext } from '../context/shared-context/shared-context-provider';

import useQueryParams from 'elementor-app/hooks/use-query-params';
import { eventTrackingObject } from 'elementor-app/consts/consts';

export default function Layout( props ) {
	const [ showInfoModal, setShowInfoModal ] = useState( false ),
		sharedContext = useContext( SharedContext ),
		{ referrer } = useQueryParams().getAll(),
		getContent = () => {
			let infoModalProps = {
				show: showInfoModal,
				setShow: setShowInfoModal,
			},
		eventTrack = ( trackName, event, eventType = 'click', element ) => {
			const eventParams = {
				...eventTrackingObject,
				placement: 'kit library',
				event,
				details: {
					...eventTrackingObject.details,
					source: 'import',
					element,
					event_type: eventType,
				},
			};

			$e.run( trackName, eventParams );
		};

			if ( 'kit-library' === referrer ) {
				infoModalProps = {
					referrer,
					...infoModalProps,
					onOpen: () => elementorCommon.events.eventTracking(
						'kit-library/modal-open',
						{
							placement: 'kit library',
							event: 'info modal load',
						},
						{
							source: 'import',
							event_type: 'load',
						},
					),
					onClose: ( e ) => {
						const element = e.target.classList.contains( 'eps-modal__overlay' ) ? 'overlay' : 'close';
						elementorCommon.events.eventTracking(
							'kit-library/modal-close',
							{
								placement: 'kit library',
								event: 'overlay' === element ? 'background page' : 'info modal close',
							},
							{
								source: 'import',
								element,
							},
						);
					},
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
					if ( 'kit-library' === referrer ) {
						elementorCommon.events.eventTracking(
							'kit-library/seek-more-info',
							{
								placement: 'kit library',
								event: 'top panel info',
							},
							{
								source: 'import',
							},
						);
					}
					setShowInfoModal( true );
				},
			};
		},
		config = {
			title: 'import' === props.type ? __( 'Import', 'elementor' ) : __( 'Export', 'elementor' ),
			headerButtons: [ getInfoButtonProps(), ...props.headerButtons ],
			content: getContent(),
			footer: props.footer,
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
