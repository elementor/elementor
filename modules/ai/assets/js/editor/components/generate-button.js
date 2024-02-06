import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { AIIcon } from '@elementor/icons';
import { useRequestIds } from '../context/requests-ids';

const GenerateButton = ( props ) => {
	const { setGenerate } = useRequestIds();
	setGenerate();

	return (
		<Button
			variant="contained"
			endIcon={ <AIIcon fontSize="small" /> }
			disabled={ ! prompt }
			aria-label={ __( 'search', 'elementor' ) }
			type="submit"
			size="small"
			{ ...props }
		/>
	);
};

export default GenerateButton;
