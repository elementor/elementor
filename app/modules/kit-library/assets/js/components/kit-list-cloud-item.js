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

const PLACEHOLDER_IMAGE_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQ1IiBoZWlnaHQ9IjMzMCIgdmlld0JveD0iMCAwIDM0NSAzMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzNDUiIGhlaWdodD0iMzMwIiBmaWxsPSIjRjNGOUZBIi8+CjxnIG9wYWNpdHk9IjAuMyI+CjxwYXRoIGQ9Ik0xODIuNDM3IDE0OS41NTVDMTg0LjAwOCAxNDkuNTU1IDE4NS41MTQgMTUwLjE3OSAxODYuNjI1IDE1MS4yOUMxODcuNzM2IDE1Mi40MDEgMTg4LjM2IDE1My45MDcgMTg4LjM2IDE1NS40NzlWMTc0LjQzN0MxODguMzYgMTc2LjAwOCAxODcuNzM2IDE3Ny41MTQgMTg2LjYyNSAxNzguNjI1QzE4NS41MTQgMTc5LjczNiAxODQuMDA4IDE4MC4zNiAxODIuNDM3IDE4MC4zNkgxNjMuNDc5QzE2MS45MDcgMTgwLjM2IDE2MC40MDEgMTc5LjczNiAxNTkuMjkgMTc4LjYyNUMxNTguMTc5IDE3Ny41MTQgMTU3LjU1NSAxNzYuMDA4IDE1Ny41NTUgMTc0LjQzN1YxNTUuNDc5QzE1Ny41NTUgMTUzLjkwNyAxNTguMTc5IDE1Mi40MDEgMTU5LjI5IDE1MS4yOUMxNjAuNDAxIDE1MC4xNzkgMTYxLjkwNyAxNDkuNTU1IDE2My40NzkgMTQ5LjU1NUgxODIuNDM3Wk0xNjMuNDc5IDE1MS45MjRDMTYyLjUzNiAxNTEuOTI0IDE2MS42MzIgMTUyLjI5OSAxNjAuOTY2IDE1Mi45NjZDMTYwLjI5OSAxNTMuNjMyIDE1OS45MjQgMTU0LjUzNiAxNTkuOTI0IDE1NS40NzlWMTY4LjQxNkwxNjUuODAxIDE2Mi41NEwxNjUuODE2IDE2Mi41MjRDMTY2LjcyNyAxNjEuNjQ4IDE2Ny44MjkgMTYxLjEzNSAxNjkuMDA4IDE2MS4xMzVDMTcwLjE4NyAxNjEuMTM1IDE3MS4yODggMTYxLjY0OCAxNzIuMTk5IDE2Mi41MjRMMTcyLjIxNiAxNjIuNTRMMTc2LjExNyAxNjYuNDQxTDE3Ni44NzUgMTY1LjY4NEMxNzcuNzg2IDE2NC44MDcgMTc4Ljg4NyAxNjQuMjk1IDE4MC4wNjYgMTY0LjI5NUMxODEuMjQ2IDE2NC4yOTUgMTgyLjM0NyAxNjQuODA3IDE4My4yNTggMTY1LjY4NEwxODMuMjc0IDE2NS42OTlMMTg1Ljk5MSAxNjguNDE2VjE1NS40NzlDMTg1Ljk5MSAxNTQuNTM2IDE4NS42MTYgMTUzLjYzMiAxODQuOTUgMTUyLjk2NkMxODQuMjg0IDE1Mi4yOTkgMTgzLjM3OSAxNTEuOTI0IDE4Mi40MzcgMTUxLjkyNEgxNjMuNDc5Wk0xNzcuOTAzIDE1NS44OTFDMTc5LjI2OSAxNTUuODkxIDE4MC4zNzYgMTU2Ljk5OCAxODAuMzc2IDE1OC4zNjNDMTgwLjM3NiAxNTkuNzI5IDE3OS4yNjkgMTYwLjgzNiAxNzcuOTAzIDE2MC44MzZDMTc2LjUzOCAxNjAuODM2IDE3NS40MzEgMTU5LjcyOSAxNzUuNDMxIDE1OC4zNjNDMTc1LjQzMSAxNTYuOTk4IDE3Ni41MzggMTU1Ljg5MSAxNzcuOTAzIDE1NS44OTFaIiBmaWxsPSIjNjk3MjdEIi8+CjwvZz4KPC9zdmc+Cg==';

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
											? `import-customization?referrer=${ KIT_SOURCE_MAP.CLOUD }&id=${ props.model.id }`
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
