import { Button } from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

const GenerateButton = ( props ) => {
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
