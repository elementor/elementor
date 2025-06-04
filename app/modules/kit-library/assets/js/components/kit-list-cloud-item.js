import { __ } from '@wordpress/i18n';
import { useNavigate } from '@reach/router';
import { useState } from 'react';
import PropTypes from 'prop-types';

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

const PopoverItem = ( { className = '', icon, title, onClick } ) => {
	const handleClick = () => {
		onClick();
	};

	const handleKeyDown = ( event ) => {
		if ( 'Enter' === event.key || ' ' === event.key ) {
			event.preventDefault();
			onClick();
		}
	};

	return (
		<div
			className={ `e-kit-library__kit-item-actions-popover-item ${ className }` }
			role="button"
			tabIndex={ 0 }
			onClick={ handleClick }
			onKeyDown={ handleKeyDown }
		>
			<i className={ icon } />
			<span>{ title }</span>
		</div>
	);
};

PopoverItem.propTypes = {
	className: PropTypes.string,
	icon: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
};

const KitActionsPopover = ( {
	isOpen,
	onClose,
	onDelete,
	className = 'e-kit-library__kit-item-actions-popover',
} ) => {
	if ( ! isOpen ) {
		return null;
	}

	return (
		<Popover
			className={ className }
			closeFunction={ onClose }
			arrowPosition="none"
		>
			<PopoverItem
				className="e-kit-library__kit-item-actions-popover-item--danger"
				icon="eicon-library-delete"
				title={ __( 'Delete', 'elementor' ) }
				onClick={ onDelete }
			/>
		</Popover>
	);
};

KitActionsPopover.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
	className: PropTypes.string,
};

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

	const handleDelete = () => {
		eventTracking( 'kit-library/cloud/delete' );
		// Delete functionality would go here
		setIsPopoverOpen( false );
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
				<KitActionsPopover
					isOpen={ isPopoverOpen }
					onClose={ () => setIsPopoverOpen( false ) }
					onDelete={ handleDelete }
				/>
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
};

export default React.memo( KitListCloudItem );
