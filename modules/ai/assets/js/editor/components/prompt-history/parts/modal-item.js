import {
	Box,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Stack,
	styled,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import EditIcon from '../../../icons/edit-icon';
import { TrashIcon } from '@elementor/icons';
import RestoreIcon from '../../../icons/restore-icon';
import ActionButton from './modal-item-action-button';
import { ACTION_TYPES, usePromptHistoryAction } from '../context/prompt-history-action-context';
import PromptHistoryActionIcon from './action-icon';
import RefreshIcon from '../../../icons/refresh-icon';
import PromptHistoryItemTitle from './modal-item-title';
import PromptHistoryItemSecondaryContent from './modal-item-secondary-content';

const StyledListItem = styled( ListItem )`
  & .e-prompt-history-item-actions {
    position: absolute;
    top: -9999px;
  }

  &:hover,
  &:focus-visible,
  &:focus-within {
    .MuiTypography-body2 {
      font-weight: 700;
      max-width: ${ ( { actionsCount } ) => `calc(100% - ${ actionsCount } * 26px)` };
    }

    .e-prompt-history-item-actions {
      position: relative;
      top: -3px;
    }
  }
`;

const StyledListItemButton = styled( ListItemButton )`
  padding: ${ ( { theme } ) => theme.spacing( 0.5, 2 ) };
  align-items: flex-start;
  cursor: inherit;
`;

const StyledListItemIcon = styled( ListItemIcon )`
  min-width: auto;

  & > .MuiSvgIcon-root {
    margin-right: ${ ( { theme } ) => theme.spacing( 1.5 ) };
    font-size: 1rem;
    position: relative;
    top: ${ ( { theme } ) => theme.spacing( 0.5 ) };
  }
`;

const StyledButtonsWrapper = styled( Box )`
  & .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

const PromptHistoryItem = ( {
	id,
	date,
	onHistoryItemDelete,
	...props
} ) => {
	const { getAllowedActions, onPromptReuse, onResultEdit, onImagesRestore } = usePromptHistoryAction();
	const { action, prompt, text, images, thumbnails, imageType, ratio } = props;
	const allowedActions = getAllowedActions();

	return (
		<StyledListItem
			tabIndex="0"
			data-testid="e-ph-i"
			disableGutters={ true }
			disablePadding={ true }
			actionsCount={ Object.keys( allowedActions ).length }>
			<StyledListItemButton component="div" role={ undefined }>
				<StyledListItemIcon>
					<PromptHistoryActionIcon action={ action } />
				</StyledListItemIcon>

				<ListItemText
					disableTypography={ true }
					primary={
						<Stack direction="row" justifyContent="space-between" alignItems="center" height="16px">
							<PromptHistoryItemTitle prompt={ prompt } />

							<StyledButtonsWrapper className="e-prompt-history-item-actions">
								{ allowedActions[ ACTION_TYPES.REMOVE ] && (
									<ActionButton
										onClick={ () => onHistoryItemDelete( id ) }
										aria-label={ __( 'Remove item', 'elementor' ) }
										tooltipTitle={ __( 'Remove', 'elementor' ) }>
										<TrashIcon />
									</ActionButton>
								) }

								{ allowedActions[ ACTION_TYPES.REUSE ] && (
									<ActionButton
										onClick={ () => onPromptReuse( id, prompt ) }
										aria-label={ __( 'Reuse prompt', 'elementor' ) }
										tooltipTitle={ __( 'Reuse prompt', 'elementor' ) }>
										<RefreshIcon />
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
					}
					secondary={ <PromptHistoryItemSecondaryContent date={ date } thumbnails={ thumbnails } /> } />
			</StyledListItemButton>
		</StyledListItem>
	);
};

PromptHistoryItem.propTypes = {
	id: PropTypes.string.isRequired,
	action: PropTypes.string.isRequired,
	prompt: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onHistoryItemDelete: PropTypes.func.isRequired,
	text: PropTypes.string,
	images: PropTypes.array,
	thumbnails: PropTypes.array,
	imageType: PropTypes.string,
	ratio: PropTypes.string,
};

export default PromptHistoryItem;
