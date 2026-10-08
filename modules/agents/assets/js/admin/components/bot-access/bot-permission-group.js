import { BanIcon, CircleCheckIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const CARD_RADIUS = '8px';

export const BotPermissionGroup = ( { icon: Icon, title, description, isAllBlocked, isDisabled, onSetAll } ) => (
	<Stack
		direction="row"
		spacing={ 1.5 }
		alignItems="flex-start"
		flex={ 1 }
		minWidth={ 0 }
		p={ 2 }
		border={ 1 }
		borderColor="divider"
		borderRadius={ CARD_RADIUS }
		bgcolor="background.paper"
	>
		<Icon fontSize="small" color="action" />
		<Stack spacing={ 1.5 } alignItems="flex-start" minWidth={ 0 }>
			<Stack spacing={ 0.5 }>
				<Typography variant="subtitle2">{ title }</Typography>
				<Typography variant="body2" color="text.secondary">{ description }</Typography>
			</Stack>
			{ isAllBlocked ? (
				<Button
					size="small"
					variant="outlined"
					color="info"
					startIcon={ <CircleCheckIcon /> }
					disabled={ isDisabled }
					onClick={ () => onSetAll( true ) }
					/* Translators: %s: Permission name. */
					aria-label={ sprintf( __( 'Enable all %s', 'elementor' ), title ) }
				>
					{ __( 'Enable all', 'elementor' ) }
				</Button>
			) : (
				<Button
					size="small"
					variant="outlined"
					color="secondary"
					startIcon={ <BanIcon /> }
					disabled={ isDisabled }
					onClick={ () => onSetAll( false ) }
					/* Translators: %s: Permission name. */
					aria-label={ sprintf( __( 'Block all %s', 'elementor' ), title ) }
				>
					{ __( 'Block all', 'elementor' ) }
				</Button>
			) }
		</Stack>
	</Stack>
);

BotPermissionGroup.propTypes = {
	icon: PropTypes.elementType.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	isAllBlocked: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onSetAll: PropTypes.func.isRequired,
};
