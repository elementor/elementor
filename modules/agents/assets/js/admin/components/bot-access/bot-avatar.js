import Avatar from '@elementor/ui/Avatar';
import PropTypes from 'prop-types';

const AVATAR_SIZE = 32;
const MUTED_OPACITY = 0.4;
const MAX_INITIALS = 2;

const getInitials = ( vendor ) => vendor
	.split( /\s+/ )
	.map( ( word ) => word.charAt( 0 ) )
	.join( '' )
	.slice( 0, MAX_INITIALS )
	.toUpperCase();

export const BotAvatar = ( { name, vendor, logoUrl, isMuted = false } ) => (
	<Avatar
		src={ logoUrl || undefined }
		alt={ name }
		sx={ {
			width: AVATAR_SIZE,
			height: AVATAR_SIZE,
			opacity: isMuted ? MUTED_OPACITY : 1,
			typography: 'caption',
			...( logoUrl && { bgcolor: 'transparent', '& img': { objectFit: 'contain' } } ),
		} }
	>
		{ getInitials( vendor ) }
	</Avatar>
);

BotAvatar.propTypes = {
	name: PropTypes.string.isRequired,
	vendor: PropTypes.string.isRequired,
	logoUrl: PropTypes.string,
	isMuted: PropTypes.bool,
};
