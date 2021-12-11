import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Text from 'elementor-app/ui/atoms/text';

export default function PluginStatusItem( { name, status } ) {
	if ( 'Not Installed' === status ) {
		return null;
	} else if ( 'inactive' === status ) {
		status = 'installed';
	} else if ( 'active' === status ) {
		status = 'activated';
	}

	return (
		<Grid container alignItems="center" key={ name }>
			<Checkbox rounded checked error={ 'failed' === status || null } onChange={ () => {} } />

			<Text tag="span" variant="xs" className="e-app-import-plugins-activation__plugin-name">
				{ name + ' ' + status }
			</Text>
		</Grid>
	);
}

PluginStatusItem.propTypes = {
	name: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
};
