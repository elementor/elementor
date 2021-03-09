import './preview-iframe.scss';

export function PreviewIframe( props ) {
	return (
		<iframe
			className="e-kit-library__preview-library"
			src={ props.previewUrl }
		/>
	);
}

PreviewIframe.propTypes = {
	previewUrl: PropTypes.string.isRequired,
};
