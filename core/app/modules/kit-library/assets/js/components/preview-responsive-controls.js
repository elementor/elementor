import { Button, Grid } from '@elementor/app-ui';
import { breakpoints } from '../pages/preview';

import './preview-responsive-controls.scss';

export default function PreviewResponsiveControls( props ) {
	return (
		<Grid container alignItems="center" justify="center" className="e-kit-library__preview-responsive-controls">
			{ breakpoints.map( ( { label, value } ) => (
				<Button
					key={ value }
					text={ label }
					hideText={ true }
					className={ `e-kit-library__preview-responsive-controls-item ${ props.active === value ? 'e-kit-library__preview-responsive-controls-item--active' : '' }` }
					icon={ `eicon-device-${ value }` }
					onClick={ () => props.onChange( value ) }
				/>
			) ) }
		</Grid>
	);
}

PreviewResponsiveControls.propTypes = {
	active: PropTypes.string,
	onChange: PropTypes.func.isRequired,
};

PreviewResponsiveControls.defaultProps = {
	active: 'desktop',
};
