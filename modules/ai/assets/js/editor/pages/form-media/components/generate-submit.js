import { Button } from '@elementor/ui';

const GenerateImagesSubmit = ( props ) => {
	return (
		<Button fullWidth size="medium" type="submit" variant="contained" { ...props }>
			{ __( 'Generate', 'elementor' ) }
		</Button>
	);
};

export default GenerateImagesSubmit;
