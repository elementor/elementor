import { Box, FormControl, Slider, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const ImageStrengthSlider = ( props ) => {
	return (
		<FormControl sx={ { width: '100%' } }>
			<Slider
				marks
				min={ 0 }
				step={ 10 }
				max={ 100 }
				color="secondary"
				id="image_strength"
				name="image_strength"
				valueLabelDisplay="auto"
				getAriaValueText={ ( value ) => `${ value }%` }
				aria-label={ __( 'Reference strength', 'elementor' ) }
				{ ...props }
			/>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="caption">{ __( 'Prompt', 'elementor' ) }</Typography>

				<Typography variant="caption">{ __( 'Reference image', 'elementor' ) }</Typography>
			</Box>
		</FormControl>
	);
};

export default ImageStrengthSlider;

