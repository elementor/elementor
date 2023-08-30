import ScreenshotContainer from './screenshot-container';

export default function ScreenshotUnavailable( props ) {
	return (
		<ScreenshotContainer { ...props } sx={ {
			...( props.sx || {} ),
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: 'background.paper',
			color: 'text.secondary',
		} }>
			{ __( 'Preview unavailable', 'elementor' ) }
		</ScreenshotContainer>
	);
}

ScreenshotUnavailable.propTypes = {
	sx: PropTypes.object,
};
