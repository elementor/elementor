import { useState, useContext, useEffect } from 'react';

import Page from 'elementor-app/layout/page';
import ContentLayout from '../shared/content-layout/content-layout';
import { infoButtonProps } from '../shared/info-modal/info-modal';
import ImportInfoModal from '../shared/info-modal/import-info-modal';
import ExportInfoModal from '../shared/info-modal/export-info-modal';
import { SharedContext } from '../context/shared-context/shared-context-provider';

import useQueryParams from 'elementor-app/hooks/use-query-params';

export default function Layout( props ) {
	const [ showInfoModal, setShowInfoModal ] = useState( false ),
		sharedContext = useContext( SharedContext ),
		{ referrer } = useQueryParams().getAll(),
		getContent = () => {
			let infoModalProps = {
				show: showInfoModal,
				setShow: setShowInfoModal,
			};

			if ( 'kit-library' === referrer ) {
				infoModalProps = {
					referrer,
					...infoModalProps,
					onOpen: () => $e.run(
						'kit-library/modal-open',
						{},
						{
							meta: {
								event: 'info modal load',
								source: 'import',
								event_type: 'load',
							},
						},
					),
					onClose: ( e ) => {
						const element = e.target.classList.contains( 'eps-modal__overlay' ) ? 'overlay' : 'close';
						$e.run(
							'kit-library/modal-close',
							{
								element,
							},
							{
								meta: {
									event: 'overlay' === element ? 'background page' : 'info modal close',
									source: 'import',
									event_type: 'load',
								},
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
						$e.run(
							'kit-library/seek-more-info',
							{},
							{
								meta: {
									event: 'top panel info',
									source: 'import',
								},
							},
						);
					}
					setShowInfoModal( true );
				},
			};
		},
		onClose = () => {
			if ( 'kit-library' === referrer ) {
				$e.run(
					'kit-library/close',
					{},
					{
						meta: {
							event: 'modal close',
							step: wizardStepNum,
							source: 'import',
						},
					},
				);
			}

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
