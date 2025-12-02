import { __ } from '@wordpress/i18n';
import { useNavigate } from '@reach/router';
import { useState, useEffect } from 'react';
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
import { AppsEventTracking } from 'elementor-app/event-track/apps-event-tracking';
import { KIT_SOURCE_MAP } from '../../../../import-export/assets/js/hooks/use-kit';
import Tooltip from 'elementor-app/molecules/tooltip';

import './kit-list-item.scss';

const PLACEHOLDER_IMAGE_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQ1IiBoZWlnaHQ9IjMzMCIgdmlld0JveD0iMCAwIDM0NSAzMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNDUiIGhlaWdodD0iMzMwIiBmaWxsPSIjRjRGNUY4Ii8+CjxwYXRoIGQ9Ik0xNjQuMjY3IDE2Ny42QzE2Ni40NzIgMTYxLjc2MSAxNzAuMjEzIDE1Ni42MjUgMTc1LjA5NCAxNTIuNzM1QzE3OS45NzUgMTQ4Ljg0NiAxODUuODE2IDE0Ni4zNDYgMTkyIDE0NS41QzE5MS4xNTUgMTUxLjY4NCAxODguNjU0IDE1Ny41MjUgMTg0Ljc2NCAxNjIuNDA2QzE4MC44NzQgMTY3LjI4OCAxNzUuNzM5IDE3MS4wMjggMTY5LjkgMTczLjIzM00xNjkuNDY3IDE1OC41QzE3My42NzcgMTYwLjQ0MyAxNzcuMDU3IDE2My44MjMgMTc5IDE2OC4wMzNNMTUzIDE4NC41VjE3NS44MzNDMTUzIDE3NC4xMTkgMTUzLjUwOCAxNzIuNDQ0IDE1NC40NjEgMTcxLjAxOEMxNTUuNDEzIDE2OS41OTMgMTU2Ljc2NiAxNjguNDgyIDE1OC4zNSAxNjcuODI2QzE1OS45MzQgMTY3LjE3IDE2MS42NzYgMTY2Ljk5OSAxNjMuMzU3IDE2Ny4zMzNDMTY1LjAzOSAxNjcuNjY4IDE2Ni41ODMgMTY4LjQ5MyAxNjcuNzk1IDE2OS43MDVDMTY5LjAwNyAxNzAuOTE3IDE2OS44MzIgMTcyLjQ2MSAxNzAuMTY3IDE3NC4xNDNDMTcwLjUwMSAxNzUuODI0IDE3MC4zMyAxNzcuNTY2IDE2OS42NzQgMTc5LjE1QzE2OS4wMTggMTgwLjczNCAxNjcuOTA3IDE4Mi4wODcgMTY2LjQ4MiAxODMuMDM5QzE2NS4wNTYgMTgzLjk5MiAxNjMuMzgxIDE4NC41IDE2MS42NjcgMTg0LjVIMTUzWiIgc3Ryb2tlPSIjQUJBQkFCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';

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
	const [ imageError, setImageError ] = useState( false );

	const isLocked = 'locked' === props.model?.status;
	const imageSrc = ( ! props.model.thumbnailUrl || imageError ) ? PLACEHOLDER_IMAGE_SRC : props.model.thumbnailUrl;

	useEffect( () => {
		setImageError( false );
	}, [ props.model.thumbnailUrl ] );

	const handleImageError = () => {
		if ( props.model.thumbnailUrl && ! imageError ) {
			setImageError( true );
		}
	};

	const handleDelete = () => {
		setIsPopoverOpen( false );

		AppsEventTracking.sendKitCloudLibraryDelete( props.model.id );

		props.onDelete();
	};

	const cardContent = (
		<Card
			className={ `e-kit-library__kit-item ${ isLocked ? 'e-kit-library__kit-item--locked' : '' }` }
		>
			<CardHeader
				className="e-kit-library__kit-item-header"
			>
				<Heading
					tag="h3"
					title={ props.model.title }
					variant="h5"
					className="eps-card__headline"
				>
					{ isLocked && (
						<Tooltip
							tag="span"
							title={ __( 'Your library is currently over the new quota. Upgrade your plan within 90 days to keep all website templates', 'elementor' ) }
						>
							<i className="eicon-lock e-kit-library__kit-item-lock-icon" aria-hidden="true"></i>
						</Tooltip>
					) }
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
				<CardImage
					alt={ props.model.title }
					src={ imageSrc }
					onError={ handleImageError }
				>
					<CardOverlay>
						<Grid container direction="column" className="e-kit-library__kit-item-cloud-overlay">
							{ isLocked ? (
								<Tooltip
									tag="span"
									title={ __( 'Your library is currently over the new quota. Upgrade your plan within 90 days to keep all website templates', 'elementor' ) }
								>
									<i className="eicon-lock e-kit-library__kit-item-lock-icon" aria-hidden="true"></i>
								</Tooltip>
							) : (
								<Button
									className="eps-button e-kit-library__kit-item-cloud-overlay-import-button eps-button--primary eps-button--sm eps-button--contained"
									text={ __( 'Apply', 'elementor' ) }
									icon="eicon-library-download"
									onClick={ () => {
										AppsEventTracking.sendKitCloudLibraryApply( props.model.id );

										const url = elementorCommon?.config?.experimentalFeatures[ 'import-export-customization' ]
											? `import?referrer=${ KIT_SOURCE_MAP.CLOUD }&id=${ props.model.id }`
											: `import?referrer=kit-library&source=${ KIT_SOURCE_MAP.CLOUD }&kit_id=${ props.model.id }`;

										navigate( url, { replace: true } );
									} }
								/>
							) }
						</Grid>
					</CardOverlay>
				</CardImage>
			</CardBody>
		</Card>
	);

	return cardContent;
};

KitListCloudItem.propTypes = {
	model: PropTypes.instanceOf( Kit ).isRequired,
	index: PropTypes.number,
	source: PropTypes.string,
	onDelete: PropTypes.func.isRequired,
};

export default React.memo( KitListCloudItem );
