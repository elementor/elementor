import { Box, IconButton, Stack, styled, Tooltip, Typography } from '@elementor/ui';
import EditIcon from '../../../icons/edit-icon';
import { getIconByAction } from '../helpers/history-item-helpers';
import { TrashIcon } from '@elementor/icons';
import RestoreIcon from '../../../icons/restore-icon';

const StyledItem = styled( Stack )`
  flex-direction: row;
	align-items: flex-start;
	padding: ${ ( { theme } ) => theme.spacing( 3, 5 ) };

	& > .MuiSvgIcon-root {
		margin-right: ${ ( { theme } ) => theme.spacing( 4 ) };
		width: 16px;
		height: 16px;
		position: relative;
		top: ${ ( { theme } ) => theme.spacing( 1 ) };
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
	margin-bottom: ${ ( { theme } ) => theme.spacing( 2 ) };
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const StyledDateSubtitle = styled( Typography )`
	color: ${ ( { theme } ) => theme.palette.secondary.light };
`;

const StyledButtonsWrapper = styled( Box )`
	& .MuiSvgIcon-root {
		width: 16px;
		height: 16px;
	}
`;

const StyledImage = styled( 'img' )`
	height: 72px;
	width: 72px;
	object-fit: cover;
	margin-right: ${ ( { theme } ) => theme.spacing( 2 ) };
`;

const ActionButton = ( { tooltipTitle, ...props } ) => {
	return (
		<Tooltip title={ tooltipTitle } placement="top" componentsProps={ {
			tooltip: {
				sx: { m: '0 !important' } },
		} } >
			<IconButton type="button"
				size="small"
				disableRipple={ true }
				disableFocusRipple={ true }
				disableTouchRipple={ true }
				{ ...props } />
		</Tooltip>
	);
};

ActionButton.propTypes = {
	tooltipTitle: PropTypes.string.isRequired,
};

const PromptHistoryItem = ( {
	action,
	prompt,
	date,
	images,
	onHistoryItemDelete,
	onPromptReuse,
	onResultEdit,
	onImagesRestore,
} ) => {
	return (
		<StyledItem tabIndex="0" data-testid="e-ph-i">
			{ getIconByAction( action ) }

			<Stack direction="column" width="90%">
				<Tooltip title={ prompt } arrow={ false } placement="bottom-start" componentsProps={ {
					tooltip: {
						sx: {
							m: '0 !important',
							py: 2,
							px: 3,
						},
					},
				} } >
					<StyledTitle variant="subtitle1" paragraph>{ prompt }</StyledTitle>
				</Tooltip>

				<Stack direction="row" justifyContent="space-between" alignItems="center" height="16px">
					<StyledDateSubtitle variant="caption">{ date }</StyledDateSubtitle>

					<StyledButtonsWrapper>
						<ActionButton
							onClick={ onHistoryItemDelete }
							aria-label={ __( 'Remove item', 'elementor' ) }
							tooltipTitle={ __( 'Remove', 'elementor' ) }>
							<TrashIcon />
						</ActionButton>

						{ onPromptReuse && (
							<ActionButton
								onClick={ onPromptReuse }
								aria-label={ __( 'Reuse prompt', 'elementor' ) }
								tooltipTitle={ __( 'Reuse prompt', 'elementor' ) }>
								<RestoreIcon />
							</ActionButton>
						) }

						{ onImagesRestore && (
							<ActionButton
								onClick={ onImagesRestore }
								aria-label={ __( 'Restore', 'elementor' ) }
								tooltipTitle={ __( 'Restore', 'elementor' ) }>
								<RestoreIcon />
							</ActionButton>
						) }

						{ onResultEdit && (
							<ActionButton
								onClick={ onResultEdit }
								aria-label={ __( 'Edit result', 'elementor' ) }
								tooltipTitle={ __( 'Edit', 'elementor' ) }>
								<EditIcon />
							</ActionButton>
						) }
					</StyledButtonsWrapper>
				</Stack>

				{ images?.length > 0 && (
					<Stack flexDirection="row" mt={ 3 }>
						{ images.map( ( image, i ) => <StyledImage key={ i } alt="" src={ image.image_url } /> ) }
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
	images: PropTypes.array,
	onHistoryItemDelete: PropTypes.func.isRequired,
	onPromptReuse: PropTypes.func,
	onResultEdit: PropTypes.func,
	onImagesRestore: PropTypes.func,
};

export default PromptHistoryItem;
