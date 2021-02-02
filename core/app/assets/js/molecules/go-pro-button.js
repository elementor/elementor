import Button from 'elementor-app/ui/molecules/button';

import useLink from '../hooks/use-link';

import Utils from 'elementor-app/utils/utils.js';

export default function GoProButton( props ) {
	const { url } = useLink(),
		baseClassName = 'e-app-go-pro-button',
		classes = [ baseClassName, props.className ],
		urlParams = props.urlParams ? '?' + props.urlParams : '';

	return (
		<Button
			{ ...props }
			className={ Utils.arrayToClassName( classes ) }
			text={ __( 'Go Pro', 'elementor' ) }
			url={ url.goPro + urlParams }
		/>
	);
}

GoProButton.propTypes = {
	className: PropTypes.string,
	urlParams: PropTypes.string,
};

GoProButton.defaultProps = {
	className: '',
	variant: 'contained',
	size: 'sm',
	color: 'cta',
	target: '_blank',
	rel: 'noopener noreferrer',
};
