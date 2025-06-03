import { __ } from '@wordpress/i18n';
import { useNavigate } from '@reach/router';
import { useState } from 'react';

import Kit from '../models/kit';
import {
	Card,
	CardHeader,
	CardBody,
	Heading,
	CardImage,
	CardOverlay,
	Grid,
	Button,
	Popover,
} from '@elementor/app-ui';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { KIT_SOURCE_MAP } from '../../../../import-export/assets/js/hooks/use-kit';

import './kit-list-item.scss';

const KitListCloudItem = ( props ) => {
	const navigate = useNavigate();

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
								eventTracking( 'kit-library/cloud-export' );
								// Export functionality would go here
								setIsPopoverOpen( false );
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud-export' );
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
								eventTracking( 'kit-library/cloud-rename' );
								// Rename functionality would go here
								setIsPopoverOpen( false );
								props.onRename();
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud-rename' );
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
								eventTracking( 'kit-library/cloud-delete' );
								setIsPopoverOpen( false );
								props.onRemove();
							} }
							onKeyDown={ ( event ) => {
								if ( 'Enter' === event.key || ' ' === event.key ) {
									event.preventDefault();
									eventTracking( 'kit-library/cloud-delete' );
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
								text={ __( 'Apply', 'elementor' ) }
								icon="eicon-library-download"
								onClick={ () => {
									eventTracking( 'kit-library/cloud-import' );
									navigate( `import?referrer=kit-library&source=${ KIT_SOURCE_MAP.CLOUD }&kit_id=${ props.model.id }`, { replace: true } );
								} }
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
	onRemove: PropTypes.func.isRequired,
	onRename: PropTypes.func.isRequired,
};

export default React.memo( KitListCloudItem );
