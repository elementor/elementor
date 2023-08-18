import { IconButton, styled } from '@elementor/ui';
import { HistoryIcon } from '@elementor/icons';

const StyledHistoryButton = styled( IconButton )`
	margin-right: 24px;

	${ ( { isActive, theme } ) => isActive && `
    background-color: ${ theme.palette.action.hover };
    color: ${ theme.palette.text.tertiary };
  ` }
`;

const PromptHistoryButton = ( { isActive, ...props } ) => {
	return (
		<StyledHistoryButton
			aria-label={ __( 'Show prompt history', 'elementor' ) }
			type="button"
			size="small"
			isActive={ isActive }
			{ ...props }
		>
			<HistoryIcon />
		</StyledHistoryButton>
	);
};

PromptHistoryButton.propTypes = {
	isActive: PropTypes.bool.isRequired,
};

export default PromptHistoryButton;
