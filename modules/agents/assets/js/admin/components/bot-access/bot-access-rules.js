import { BOT_PERMISSION_SETTING_KEYS, BOT_PERMISSIONS, DEFAULT_BOT_PERMISSIONS } from '../../constants';

const withAllPermissions = ( value ) => Object.fromEntries( BOT_PERMISSIONS.map( ( permission ) => [ permission, value ] ) );

export const isRowAllBlocked = ( bot ) => BOT_PERMISSIONS.every( ( permission ) => ! bot[ permission ] );

export const isColumnAllBlocked = ( bots, permission ) => bots.every( ( bot ) => ! bot[ permission ] );

export const setColumn = ( bots, permission, value ) => bots.map( ( bot ) => ( { ...bot, [ permission ]: value } ) );

export const setRow = ( bots, token, value ) => bots.map( ( bot ) => (
	bot.token === token ? { ...bot, ...withAllPermissions( value ) } : bot
) );

export const togglePermission = ( bots, token, permission ) => bots.map( ( bot ) => (
	bot.token === token ? { ...bot, [ permission ]: ! bot[ permission ] } : bot
) );

export const addBot = ( bots, token, catalogTokens ) => {
	if ( bots.some( ( bot ) => bot.token === token ) ) {
		return bots;
	}

	const nextBots = [ ...bots, { token, ...DEFAULT_BOT_PERMISSIONS } ];

	return nextBots.sort( ( first, second ) => catalogTokens.indexOf( first.token ) - catalogTokens.indexOf( second.token ) );
};

export const toSettingsBots = ( bots ) => Object.fromEntries( bots.map( ( bot ) => [
	bot.token,
	Object.fromEntries( BOT_PERMISSIONS.map( ( permission ) => [ BOT_PERMISSION_SETTING_KEYS[ permission ], bot[ permission ] ] ) ),
] ) );
