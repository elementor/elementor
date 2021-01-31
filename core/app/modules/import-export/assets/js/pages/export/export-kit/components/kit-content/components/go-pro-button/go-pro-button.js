import Button from 'elementor-app/ui/molecules/button';

import useLink from '../../../../../../../hooks/use-link/use-link';

import Utils from 'elementor-app/utils/utils.js';

export default function GoProButton( props ) {
	const { url } = useLink(),
		baseClassName = 'eps-go-pro-button',
		classes = [ baseClassName, props.className ];

	return (
		<Button
			className={ Utils.arrayToClassName( classes ) }
			variant="contained"
			size="sm"
			color="cta"
			text={ __( 'Go Pro', 'elementor' ) }
			url={ url.goPro }
			target="_blank"
			rel="noopener noreferrer"
		/>
	);
}

GoProButton.propTypes = {
	className: PropTypes.string,
};

GoProButton.defaultProps = {
	className: '',
};
