import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import ScreenshotContainer from './screenshot-container';

export default function ScreenshotUnavailable( props ) {
	return (
		<ScreenshotContainer { ...props } sx={ {
			...( props.sx || {} ),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'background.paper',
			color: 'text.tertiary',
			fontStyle: 'italic',
			fontSize: '12px',
			paddingInline: 12,
			textAlign: 'center',
			lineHeight: 1.5,
		} }>
			{ __( 'Preview unavailable', 'elementor' ) }
		</ScreenshotContainer>
	);
}

ScreenshotUnavailable.propTypes = {
	sx: PropTypes.object,
};
