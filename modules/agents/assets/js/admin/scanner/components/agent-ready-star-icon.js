import SvgIcon from '@elementor/ui/SvgIcon';
import PropTypes from 'prop-types';

const ICON_SIZE = 24;

const ANGI_STARS_PATH = 'M17.7696 11.7602L17.5099 11.7499C14.6724 11.6381 12.3619 9.32784 12.2501 6.49032L12.2398 6.2304C12.2347 6.10176 12.1289 6 12 6C11.8711 6 11.7653 6.10176 11.7602 6.2304L11.7499 6.49032C11.6381 9.32784 9.32784 11.6381 6.49008 11.7499L6.2304 11.7602C6.10176 11.7653 6 11.8711 6 12C6 12.1289 6.10176 12.2347 6.23064 12.2398L6.49032 12.2498C9.32784 12.3619 11.6381 14.6722 11.7499 17.5097L11.7602 17.7696C11.7653 17.8982 11.8711 18 12 18C12.1289 18 12.2347 17.8982 12.2398 17.7696L12.2501 17.5097C12.3619 14.6722 14.6722 12.3619 17.5097 12.2498L17.7694 12.2398C17.8982 12.2347 18 12.1289 18 12C18 11.8711 17.8982 11.7653 17.7696 11.7602Z';

export const AgentReadyStarIcon = ( { sx, ...props } ) => (
	<SvgIcon
		viewBox="0 0 24 24"
		aria-hidden
		sx={ {
			width: ICON_SIZE,
			height: ICON_SIZE,
			flexShrink: 0,
			...sx,
		} }
		{ ...props }
	>
		<path d={ ANGI_STARS_PATH } fill="currentColor" />
	</SvgIcon>
);

AgentReadyStarIcon.propTypes = {
	sx: PropTypes.oneOfType( [ PropTypes.object, PropTypes.array, PropTypes.func ] ),
};
