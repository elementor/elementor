import { Box, Stack, styled, Tooltip, Typography } from '@elementor/ui';
import EditIcon from '../../../icons/edit-icon';
import { TrashIcon } from '@elementor/icons';
import RestoreIcon from '../../../icons/restore-icon';
import { getImageThumbnailURL } from '../helpers/image-helpers';
import ActionButton from './modal-item-action-button';
import { ACTION_TYPES, usePromptHistoryAction } from '../context/prompt-history-action-context';
import PromptHistoryActionIcon from './action-icon';

const StyledItem = styled( Stack )`
  flex-direction: row;
	align-items: flex-start;
	padding: ${ ( { theme } ) => theme.spacing( 1, 2 ) };

	& > .MuiSvgIcon-root {
		margin-right: ${ ( { theme } ) => theme.spacing( 1.5 ) };
		position: relative;
		top: ${ ( { theme } ) => theme.spacing( 0.25 ) };
	}

  & .MuiIconButton-root {
		position: absolute;
		top: -9999px;
	}

	&:hover,
	&:focus-visible {
		background-color: ${ ( { theme } ) => theme.palette.secondary.background };

		.MuiTypography-subtitle1 {
			font-weight: 700;
		}
	}

	&:hover .MuiIconButton-root,
	&:focus-visible .MuiIconButton-root,
	.MuiIconButton-root:focus-visible {
		position: relative;
		top: 0;
	}
`;

const StyledTitle = styled( Typography )`
	margin-bottom: ${ ( { theme } ) => theme.spacing( 0.5 ) };
	font-size: 14px;
`;

const StyledDateSubtitle = styled( Typography )`
	color: ${ ( { theme } ) => theme.palette.secondary.light };
`;

const StyledButtonsWrapper = styled( Box )`
	& .MuiSvgIcon-root {
		font-size: 1rem;
	}
`;

const StyledImage = styled( 'img' )`
	height: 72px;
	width: 72px;
	object-fit: cover;
	margin-right: ${ ( { theme } ) => theme.spacing( 0.5 ) };
`;

const PromptHistoryItem = ( {
	id,
	date,
	onHistoryItemDelete,
	...props
} ) => {
	const { getAllowedActions, onPromptReuse, onResultEdit, onImagesRestore } = usePromptHistoryAction();
	const { action, prompt, text, images, imageType, ratio } = props;
	const allowedActions = getAllowedActions();

	return (
		<StyledItem tabIndex="0" data-testid="e-ph-i">
			<PromptHistoryActionIcon action={ action } />

			<Stack direction="column" width="90%">
				<Tooltip title={ prompt } arrow={ false } placement="bottom-start" componentsProps={ {
					tooltip: {
						sx: {
							m: '0 !important',
							py: 0.5,
							px: 1,
						},
					},
				} } >
					<StyledTitle variant="subtitle1" noWrap paragraph>{ prompt }</StyledTitle>
				</Tooltip>

				<Stack direction="row" justifyContent="space-between" alignItems="center" height="16px">
					<StyledDateSubtitle variant="caption">{ date }</StyledDateSubtitle>

					<StyledButtonsWrapper>
						<ActionButton
							onClick={ () => onHistoryItemDelete( id ) }
							aria-label={ __( 'Remove item', 'elementor' ) }
							tooltipTitle={ __( 'Remove', 'elementor' ) }>
							<TrashIcon />
						</ActionButton>

						{ allowedActions[ ACTION_TYPES.REUSE ] && (
							<ActionButton
								onClick={ () => onPromptReuse( id, prompt ) }
								aria-label={ __( 'Reuse prompt', 'elementor' ) }
								tooltipTitle={ __( 'Reuse prompt', 'elementor' ) }>
								<RestoreIcon />
							</ActionButton>
						) }

						{ allowedActions[ ACTION_TYPES.RESTORE ] && (
							<ActionButton
								onClick={ () => onImagesRestore( id, { prompt, images, imageType, ratio } ) }
								aria-label={ __( 'Restore', 'elementor' ) }
								tooltipTitle={ __( 'Restore', 'elementor' ) }>
								<RestoreIcon />
							</ActionButton>
						) }

						{ allowedActions[ ACTION_TYPES.EDIT ] && (
							<ActionButton
								onClick={ () => onResultEdit( id, text ) }
								aria-label={ __( 'Edit result', 'elementor' ) }
								tooltipTitle={ __( 'Edit', 'elementor' ) }>
								<EditIcon />
							</ActionButton>
						) }
					</StyledButtonsWrapper>
				</Stack>

				{ images?.length > 0 && (
					<Stack flexDirection="row" mt={ 1 }>
						{ images.map(
							/**
							 * @param {Object} image
							 * @return {React.ReactNode}
							 */ ( image ) => (
								<StyledImage key={ `thumbnail-${ image.seed }` }
									alt=""
									src={ getImageThumbnailURL( image.image_url ) } />
							) ) }
					</Stack>
				) }
			</Stack>
		</StyledItem> );
};

PromptHistoryItem.propTypes = {
	id: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
	prompt: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onHistoryItemDelete: PropTypes.func.isRequired,
	text: PropTypes.string,
	images: PropTypes.array,
	imageType: PropTypes.string,
	ratio: PropTypes.string,
};

export default PromptHistoryItem;
