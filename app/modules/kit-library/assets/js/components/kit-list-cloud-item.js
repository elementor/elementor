import Kit from '../models/kit';
import { Card, CardHeader, CardBody, Heading, CardImage, CardOverlay, Grid, Button, Popover } from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';

import './kit-list-item.scss';

const KitListCloudItem = ( props ) => {
	const [ isPopoverOpen, setIsPopoverOpen ] = useState( false );

	const eventTracking = ( command ) => {
		appsEventTrackingDispatch(
			command,
			{
				kit_name: props.model.title,
				grid_location: props.index,
				page_source: 'cloud',
			},
		);
	};

	return (
		<Card className="e-kit-library__kit-item">
			<CardHeader
				className="e-kit-library__kit-item-header"
			>
				<Heading
					tag="h3"
					title={ props.model.title }
					variant="h5"
					className="eps-card__headline"
				>
					{ props.model.title }
				</Heading>
				<Button
					text={ __( 'Actions', 'elementor' ) }
					hideText={ true }
					icon="eicon-ellipsis-v"
					className="e-kit-library__kit-item-actions-menu"
					onClick={ ( event ) => {
						event.stopPropagation();
						setIsPopoverOpen( true );
					} }
				/>
				{ isPopoverOpen && (
					<Popover
						className="e-kit-library__kit-item-actions-popover"
						closeFunction={ () => setIsPopoverOpen( false ) }
						arrowPosition="none"
					>
						<div
							className="e-kit-library__kit-item-actions-popover-item"
							role="button"
							tabIndex={ 0 }
							onClick={ () => {
								eventTracking( 'kit-library/cloud/export' );
								// Export functionality would go here
								setIsPopoverOpen( false );
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud/export' );
									setIsPopoverOpen( false );
								}
							} }
						>
							<i className="eicon-library-download" />
							<span>{ __( 'Export', 'elementor' ) }</span>
						</div>
						<div
							className="e-kit-library__kit-item-actions-popover-item"
							role="button"
							tabIndex={ 0 }
							onClick={ () => {
								eventTracking( 'kit-library/cloud/rename' );
								// Rename functionality would go here
								setIsPopoverOpen( false );
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud/rename' );
									setIsPopoverOpen( false );
								}
							} }
						>
							<i className="eicon-library-edit" />
							<span>{ __( 'Rename', 'elementor' ) }</span>
						</div>
						<div
							className="e-kit-library__kit-item-actions-popover-item e-kit-library__kit-item-actions-popover-item--danger"
							role="button"
							tabIndex={ 0 }
							onClick={ () => {
								eventTracking( 'kit-library/cloud/delete' );
								// Delete functionality would go here
								setIsPopoverOpen( false );
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud/delete' );
									setIsPopoverOpen( false );
								}
							} }
						>
							<i className="eicon-library-delete" />
							<span>{ __( 'Delete', 'elementor' ) }</span>
						</div>
					</Popover>
				) }
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.model.title } src={ props.model.thumbnailUrl || '' }>
					<CardOverlay>
						<Grid container direction="column" className="e-kit-library__kit-item-cloud-overlay">
							<Button
								className="eps-button e-kit-library__kit-item-cloud-overlay-import-button eps-button--primary eps-button--sm eps-button--contained"
								text={ __( 'Import Kit', 'elementor' ) }
								icon="eicon-library-download"
								onClick={ () => eventTracking( 'kit-library/cloud/import' ) }
							/>
						</Grid>
					</CardOverlay>
				</CardImage>
			</CardBody>
		</Card>
	);
};

KitListCloudItem.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	index: PropTypes.number,
	source: PropTypes.string,
};

export default React.memo( KitListCloudItem );
