import { Button } from '@elementor/ui';

const GenerateImagesSubmit = ( props ) => {
	const label = props.children ?? __( 'Generate', 'elementor' );
	return (
		<Button fullWidth size="medium" type="submit" variant="contained" { ...props }>
			{ label }
		</Button>
	);
};
GenerateImagesSubmit.propTypes = {
	children: PropTypes.any,
}
export default GenerateImagesSubmit;
