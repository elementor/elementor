import { Box, IconButton, Stack, styled, Typography } from '@elementor/ui';
import EditIcon from '../../../icons/edit-icon';
import CopyIcon from '../../../icons/copy-icon';
import { getIconByAction } from '../helpers/history-item-helpers';
import { TrashIcon } from '@elementor/icons';

const StyledPeriod = styled( Stack )`
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

const ActionButton = ( props ) => {
	return <IconButton type="button"
		size="small"
		disableRipple={ true }
		disableFocusRipple={ true }
		disableTouchRipple={ true }
		{ ...props } />;
};

const PromptHistoryItem = ( { action, prompt, date, onHistoryItemDelete, onPromptCopy, onResultEdit } ) => {
	return (
		<StyledPeriod tabIndex="0">
			{ getIconByAction( action ) }

			<Stack direction="column" width="90%">
				<StyledTitle variant="subtitle1" paragraph>{ prompt }</StyledTitle>

				<Stack direction="row" justifyContent="space-between" alignItems="center" height="16px">
					<StyledDateSubtitle variant="caption">{ date }</StyledDateSubtitle>

					<StyledButtonsWrapper>
						<ActionButton
							onClick={ onHistoryItemDelete }
							aria-label={ __( 'Delete prompt', 'elementor' ) }>
							<TrashIcon />
						</ActionButton>

						<ActionButton
							onClick={ onPromptCopy }
							aria-label={ __( 'Copy prompt', 'elementor' ) }>
							<CopyIcon />
						</ActionButton>

						<ActionButton
							onClick={ onResultEdit }
							aria-label={ __( 'Copy result', 'elementor' ) }>
							<EditIcon />
						</ActionButton>
					</StyledButtonsWrapper>
				</Stack>
			</Stack>
		</StyledPeriod> );
};

PromptHistoryItem.propTypes = {
	id: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
	prompt: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onHistoryItemDelete: PropTypes.func.isRequired,
	onPromptCopy: PropTypes.func.isRequired,
	onResultEdit: PropTypes.func.isRequired,
};

export default PromptHistoryItem;
