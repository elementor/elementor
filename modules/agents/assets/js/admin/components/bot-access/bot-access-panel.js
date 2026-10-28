import { AlertCircleIcon } from '@elementor/icons';
import Chip from '@elementor/ui/Chip';
import Stack from '@elementor/ui/Stack';
import Typography from '@elementor/ui/Typography';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { AddBotControl } from './add-bot-control';
import { BotAccessTable } from './bot-access-table';
import { isColumnAllBlocked } from './bot-access-rules';
import { BotPermissionGroup } from './bot-permission-group';
import { getBotPermissions } from './bot-permissions';

const SECTIONS_SPACING = 5;
const CARDS_SPACING = 3;
const HEADER_PADDING_Y = 2.5;

export const BotAccessPanel = ( { settings } ) => {
	const {
		addBot,
		bots,
		catalog,
		hasPhysicalFile,
		isEnabled,
		isSaving,
		setColumn,
		setRow,
		togglePermission,
	} = settings;

	const isDisabled = ! isEnabled || isSaving;
	const managedTokens = new Set( bots.map( ( bot ) => bot.token ) );
	const availableBots = catalog.filter( ( bot ) => ! managedTokens.has( bot.token ) );

	return (
		<Stack spacing={ SECTIONS_SPACING } px={ 6 } py={ 3 }>
			<Stack spacing={ 2 }>
				<Typography variant="subtitle1">
					{ __( 'Control how agents use your content', 'elementor' ) }
				</Typography>
				{ hasPhysicalFile && (
					<Stack direction="row">
						<Chip
							icon={ <AlertCircleIcon /> }
							label={ __( 'A robots.txt file already exists and can’t be managed here.', 'elementor' ) }
							color="warning"
							size="small"
							shape="rounded"
							variant="standard"
						/>
					</Stack>
				) }
				<Stack direction="row" spacing={ CARDS_SPACING }>
					{ getBotPermissions().map( ( { permission, icon, title, description } ) => (
						<BotPermissionGroup
							key={ permission }
							icon={ icon }
							title={ title }
							description={ description }
							isAllBlocked={ isColumnAllBlocked( bots, permission ) }
							isDisabled={ isDisabled || ! bots.length }
							onSetAll={ ( value ) => setColumn( permission, value ) }
						/>
					) ) }
				</Stack>
			</Stack>
			<Stack>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					py={ HEADER_PADDING_Y }
				>
					<Typography variant="subtitle1">
						{ __( 'Manage bot access', 'elementor' ) }
					</Typography>
					<AddBotControl options={ availableBots } isDisabled={ isDisabled } onAdd={ addBot } />
				</Stack>
				<BotAccessTable
					bots={ bots }
					catalog={ catalog }
					isDisabled={ isDisabled }
					onTogglePermission={ togglePermission }
					onSetRow={ setRow }
				/>
			</Stack>
		</Stack>
	);
};

BotAccessPanel.propTypes = {
	settings: PropTypes.shape( {
		addBot: PropTypes.func.isRequired,
		bots: PropTypes.array.isRequired,
		catalog: PropTypes.array.isRequired,
		hasPhysicalFile: PropTypes.bool.isRequired,
		isEnabled: PropTypes.bool.isRequired,
		isSaving: PropTypes.bool.isRequired,
		setColumn: PropTypes.func.isRequired,
		setRow: PropTypes.func.isRequired,
		togglePermission: PropTypes.func.isRequired,
	} ).isRequired,
};
