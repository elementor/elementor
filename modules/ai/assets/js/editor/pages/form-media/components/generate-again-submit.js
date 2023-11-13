import { Button } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import RefreshIcon from '../../../icons/refresh-icon';

const GenerateAgainSubmit = ( props ) => {
	return (
		<Button
			fullWidth
			type="submit"
			variant="contained"
			color="secondary"
			startIcon={ <RefreshIcon /> }
			sx={ {
				// TODO: Remove on @elementor/ui 1.4.51.
				color: 'background.paper',
			} }
			{ ...props }
		>
			{ __( 'Generate again', 'elementor' ) }
		</Button>
	);
};

export default GenerateAgainSubmit;
