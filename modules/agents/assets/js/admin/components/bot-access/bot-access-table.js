import Box from '@elementor/ui/Box';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { BOT_TABLE_COLUMN_WIDTHS } from '../../constants';
import { BotAccessRow } from './bot-access-row';
import { getBotPermissions } from './bot-permissions';

const HEADER_PADDING_Y = 1.25;

export const BotAccessTable = ( { bots, catalog, isDisabled, onTogglePermission, onSetRow } ) => {
	const catalogByToken = Object.fromEntries( catalog.map( ( catalogBot ) => [ catalogBot.token, catalogBot ] ) );
	const rows = bots.filter( ( bot ) => catalogByToken[ bot.token ] );

	return (
		<Stack>
			<Stack
				direction="row"
				alignItems="center"
				px={ 3 }
				py={ HEADER_PADDING_Y }
				borderBottom={ 1 }
				borderColor="divider"
			>
				<Typography variant="body2" color="text.secondary" flexGrow={ 1 }>
					{ __( 'Agent', 'elementor' ) }
				</Typography>
				{ getBotPermissions().map( ( { permission, title } ) => (
					<Typography
						key={ permission }
						variant="body2"
						color="text.secondary"
						width={ BOT_TABLE_COLUMN_WIDTHS[ permission ] }
						flexShrink={ 0 }
					>
						{ title }
					</Typography>
				) ) }
				<Box width={ BOT_TABLE_COLUMN_WIDTHS.action } flexShrink={ 0 } />
			</Stack>
			{ rows.map( ( bot ) => (
				<BotAccessRow
					key={ bot.token }
					bot={ bot }
					catalogBot={ catalogByToken[ bot.token ] }
					isDisabled={ isDisabled }
					onTogglePermission={ onTogglePermission }
					onSetRow={ onSetRow }
				/>
			) ) }
		</Stack>
	);
};

BotAccessTable.propTypes = {
	bots: PropTypes.arrayOf( PropTypes.shape( {
		token: PropTypes.string.isRequired,
	} ) ).isRequired,
	catalog: PropTypes.arrayOf( PropTypes.shape( {
		token: PropTypes.string.isRequired,
	} ) ).isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onTogglePermission: PropTypes.func.isRequired,
	onSetRow: PropTypes.func.isRequired,
};
