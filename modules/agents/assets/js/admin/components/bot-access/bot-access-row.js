import { BanIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import Button from '@elementor/ui/Button';
import IconButton from '@elementor/ui/IconButton';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { BOT_TABLE_COLUMN_WIDTHS } from '../../constants';
import { isRowAllBlocked } from './bot-access-rules';
import { BotAvatar } from './bot-avatar';
import { getBotPermissions } from './bot-permissions';
import { wpAdminSwitchSx } from '../wp-admin-sx';

const ROW_PADDING_Y = 1.625;

export const BotAccessRow = ( { bot, catalogBot, isDisabled, onTogglePermission, onSetRow } ) => {
	const isMuted = isRowAllBlocked( bot );
	const textColor = isMuted ? 'text.disabled' : 'text.primary';
	const vendorColor = isMuted ? 'text.disabled' : 'text.secondary';

	return (
		<Stack
			direction="row"
			alignItems="center"
			px={ 3 }
			py={ ROW_PADDING_Y }
			borderBottom={ 1 }
			borderColor="divider"
		>
			<Stack direction="row" spacing={ 1.5 } alignItems="center" flexGrow={ 1 } minWidth={ 0 }>
				<BotAvatar
					name={ catalogBot.name }
					vendor={ catalogBot.vendor }
					logoUrl={ catalogBot.logoUrl }
					isMuted={ isMuted }
				/>
				<Stack direction="row" spacing={ 1 } alignItems="baseline" minWidth={ 0 }>
					<Typography variant="subtitle2" color={ textColor } noWrap>{ catalogBot.name }</Typography>
					<Typography variant="body2" color={ vendorColor } noWrap>{ catalogBot.vendor }</Typography>
				</Stack>
			</Stack>
			{ getBotPermissions().map( ( { permission, title } ) => (
				<Box key={ permission } width={ BOT_TABLE_COLUMN_WIDTHS[ permission ] } flexShrink={ 0 }>
					<Switch
						size="small"
						checked={ bot[ permission ] }
						disabled={ isDisabled }
						onChange={ () => onTogglePermission( bot.token, permission ) }
						inputProps={ {
							/* Translators: 1: Permission name, 2: Bot name. */
							'aria-label': sprintf( __( '%1$s for %2$s', 'elementor' ), title, catalogBot.name ),
						} }
						sx={ wpAdminSwitchSx }
					/>
				</Box>
			) ) }
			<Stack
				direction="row"
				justifyContent="flex-end"
				width={ BOT_TABLE_COLUMN_WIDTHS.action }
				flexShrink={ 0 }
			>
				{ isMuted ? (
					<Button
						size="small"
						variant="text"
						color="info"
						disabled={ isDisabled }
						onClick={ () => onSetRow( bot.token, true ) }
					>
						{ __( 'Enable', 'elementor' ) }
					</Button>
				) : (
					<IconButton
						size="small"
						disabled={ isDisabled }
						onClick={ () => onSetRow( bot.token, false ) }
						/* Translators: %s: Bot name. */
						aria-label={ sprintf( __( 'Block %s', 'elementor' ), catalogBot.name ) }
					>
						<BanIcon fontSize="small" />
					</IconButton>
				) }
			</Stack>
		</Stack>
	);
};

BotAccessRow.propTypes = {
	bot: PropTypes.shape( {
		token: PropTypes.string.isRequired,
		search: PropTypes.bool.isRequired,
		aiInput: PropTypes.bool.isRequired,
		aiTrain: PropTypes.bool.isRequired,
	} ).isRequired,
	catalogBot: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		vendor: PropTypes.string.isRequired,
		logoUrl: PropTypes.string,
	} ).isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onTogglePermission: PropTypes.func.isRequired,
	onSetRow: PropTypes.func.isRequired,
};
