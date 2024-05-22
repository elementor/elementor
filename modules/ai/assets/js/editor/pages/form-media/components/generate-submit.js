import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const GenerateSubmit = ( props ) => {
	return (
		<Button fullWidth size="medium" type="submit" variant="contained" { ...props } >
			{ props.children || __( 'Generate', 'elementor' ) }
		</Button>
	);
};
GenerateSubmit.propTypes = {
	children: PropTypes.node,
};
export default GenerateSubmit;
