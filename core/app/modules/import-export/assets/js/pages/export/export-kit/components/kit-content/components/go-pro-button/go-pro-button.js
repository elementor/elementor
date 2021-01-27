import Button from 'elementor-app/ui/molecules/button';

import useLink from '../../../../../../../hooks/use-link/use-link';

export default function GoProButton( props ) {
	const { url } = useLink();

	return (
		<Button
			className={ props.className }
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
