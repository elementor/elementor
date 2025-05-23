import Button from 'elementor-app/ui/molecules/button';

import { arrayToClassName } from 'elementor-app/utils/utils.js';

export default function GoProButton( props ) {
	const baseClassName = 'e-app-go-pro-button',
		classes = [ baseClassName, props.className ];

	return (
		<Button
			{ ...props }
			className={ arrayToClassName( classes ) }
			text={ props.text }
		/>
	);
}

GoProButton.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
};

GoProButton.defaultProps = {
	className: '',
	variant: 'outlined',
	size: 'sm',
	color: 'cta',
	target: '_blank',
	rel: 'noopener noreferrer',
	text: __( 'Upgrade Now', 'elementor' ),
};
