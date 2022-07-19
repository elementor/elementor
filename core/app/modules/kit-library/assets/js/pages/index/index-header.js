import Header from '../../components/layout/header';
import { ModalProvider, Heading, Text, Button } from '@elementor/app-ui';
import { useMemo, useState, useRef } from 'react';
import { useNavigate } from '@reach/router';
import PopoverDialog from 'elementor-app/ui/popover-dialog/popover-dialog';

import './index-header.scss';
import { eventTrackingObject } from 'elementor-app/consts/consts';

export default function IndexHeader( props ) {
	const navigate = useNavigate();
	const [ isInfoModalOpen, setIsInfoModalOpen ] = useState( false );
	const importRef = useRef();

	const eventTrack = ( trackName, event, eventType = 'click' ) => {
		const eventParams = {
			...eventTrackingObject,
			placement: 'kit library',
			event,
			details: {
				...eventTrackingObject.details,
				source: 'home page',
				event_type: eventType,
			},
		};

		$e.run( trackName, eventParams );
	};
	const buttons = useMemo( () => [
		{
			id: 'info',
			text: __( 'Info', 'elementor-pro' ),
			hideText: true,
			icon: 'eicon-info-circle-o',
			onClick: () => {
				elementorCommon.events.eventTracking(
					'kit-library/seek-more-info',
					{
						placement: 'kit library',
						event: 'top panel info',
					},
					{
						source: 'home page',
					},
				);
				setIsInfoModalOpen( true );
			},
		},
		{
			id: 'refetch',
			text: __( 'Refetch', 'elementor-pro' ),
			hideText: true,
			icon: `eicon-sync ${ props.isFetching ? 'eicon-animation-spin' : '' }`,

			onClick: () => {
				elementorCommon.events.eventTracking(
					'kit-library/refetch',
					{
						placement: 'kit library',
						event: 'top panel refetch',
					},
					{
						source: 'home page',
					},
				);
				props.refetch();
			},
		},
		{
			id: 'import',
			text: __( 'Import', 'elementor-pro' ),
			hideText: true,
			icon: 'eicon-upload-circle-o',
			elRef: importRef,
			onClick: () => {
				elementorCommon.events.eventTracking(
					'kit-library/kit-import',
					{
						placement: 'kit library',
						event: 'top panel kit import',
					},
					{
						source: 'home page',
					},
				);
				navigate( '/import?referrer=kit-library' );
			},
		},
	], [ props.isFetching, props.refetch ] );

	return (
		<>
			<Header buttons={ buttons } />
			<PopoverDialog
				targetRef={ importRef }
				wrapperClass="e-kit-library__tooltip"
			>
				{ __( 'Import Kit', 'elementor' ) }
			</PopoverDialog>
			<ModalProvider title={ __( 'Welcome to the Library', 'elementor' ) }
				show={ isInfoModalOpen }
				setShow={ setIsInfoModalOpen }
				onOpen={ () => elementorCommon.events.eventTracking(
					'kit-library/modal-open',
					{
						placement: 'kit library',
						event: 'info modal load',
					},
					{
						source: 'home page',
						event_type: 'load',
					},
				) }
				onClose={ ( e ) => {
					const element = e.target.classList.contains( 'eps-modal__overlay' ) ? 'overlay' : 'close';
					elementorCommon.events.eventTracking(
						'kit-library/modal-close',
						{
							placement: 'kit library',
							event: 'overlay' === element ? 'background page' : 'info modal close',
						},
						{
							source: 'home page',
							element,
						},
					);
				} }
			>
				<div className="e-kit-library-header-info-modal-container">
					<Heading tag="h3" variant="h3">{ __( 'What\'s a kit?', 'elementor' ) }</Heading>
					<Text>{ __( 'A Template Kit is full, ready-made design that you can apply to your site. It includes all the pages, parts, settings and content that you\'d expect in a fully functional website.', 'elementor' ) }</Text>
				</div>
				<div className="e-kit-library-header-info-modal-container">
					<Heading tag="h3" variant="h3">{ __( 'What\'s going on in the Kit Library?', 'elementor' ) }</Heading>
					<Text>
						{ __( 'Search & filter for kits by category and tags, or browse through individual kits to see what\'s inside.', 'elementor' ) }
						<br />
						{ __( 'Once you\'ve picked a winner, apply it to your site!', 'elementor' ) }
					</Text>
				</div>
				<div>
					<Heading tag="h3" variant="h3">{ __( 'Happy browsing!', 'elementor' ) }</Heading>
					<Text>
						<Button
							url="https://go.elementor.com/app-kit-library-how-to-use-kits/"
							target="_blank"
							rel="noreferrer"
							text={ __( 'Learn more', 'elementor' ) }
							color="link"
							onClick={ () => {
								elementorCommon.events.eventTracking(
								'kit-library/seek-more-info',
								{
									placement: 'kit library',
									event: 'info modal learn more',
								},
								{
									source: 'home page',
								} );
								setIsInfoModalOpen( true );
							} }
						/>{ ' ' }
						{ __( 'about using templates', 'elementor' ) }
					</Text>
				</div>
			</ModalProvider>
		</>
	);
}

IndexHeader.propTypes = {
	refetch: PropTypes.func.isRequired,
	isFetching: PropTypes.bool,
};
