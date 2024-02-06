import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { useRequestIds } from '../../../context/requests-ids';

const GenerateSubmit = ( props ) => {
	const { setGenerate } = useRequestIds();
	setGenerate();

	return (
		<Button fullWidth size="medium" type="submit" variant="contained" { ...props }>
			{ props.children || __( 'Generate', 'elementor' ) }
		</Button>
	);
};
GenerateSubmit.propTypes = {
	children: PropTypes.node,
};
export default GenerateSubmit;
