import Button from 'elementor-app/ui/molecules/button';

import Utils from 'elementor-app/utils/utils.js';

export default function GoProButton( props ) {
	const baseClassName = 'e-app-go-pro-button',
		classes = [ baseClassName, props.className ];

	return (
		<Button
			{ ...props }
			className={ Utils.arrayToClassName( classes ) }
			text={ __( 'Go Pro', 'elementor' ) }
		/>
	);
}

GoProButton.propTypes = {
	className: PropTypes.string,
};

GoProButton.defaultProps = {
	className: '',
	variant: 'contained',
	size: 'sm',
	color: 'cta',
	target: '_blank',
	rel: 'noopener noreferrer',
};
