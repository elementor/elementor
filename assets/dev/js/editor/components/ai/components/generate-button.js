import { Button } from '@elementor/ui';
import { AIIcon } from '@elementor/icons';

const GenerateButton = ( props ) => {
	return (
		<Button
			variant="contained"
			endIcon={ <AIIcon /> }
			disabled={ ! prompt }
			aria-label={ __( 'search', 'elementor' ) }
			type="submit"
			size="small"
			sx={ {
				'& .MuiButton-endIcon': {
					width: 18,
				},
			} }
			{ ...props }
		/>
	);
};

export default GenerateButton;
