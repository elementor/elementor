import { useState, useEffect } from 'react';

import usePlugins from '../../../../../hooks/use-plugins';

import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Text from 'elementor-app/ui/atoms/text';

export default function PluginStatusItem( { name, slug, status, onReady } ) {
	const [ actionStatus, setActionStatus ] = useState( '' ),
		{ pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins();

	useEffect( () => {
		const action = 'inactive' === status ? 'activate' : 'install';

		pluginsActions[ action ]( slug );
	}, [] );

	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			if ( 'active' === pluginsState.data.status ) {
				const finalStatus = 'inactive' === status ? 'activated' : 'installed';

				setActionStatus( finalStatus );
			} else if ( 'inactive' === pluginsState.data.status ) {
				/*
					In case that the widget was installed it will be inactive after the installation.
					Therefore, the actions should be reset and the plugin should be activated.
				 */
				pluginsActions.reset();

				pluginsActions.activate( slug );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		if ( actionStatus ) {
			onReady( name );
		}
	}, [ actionStatus ] );

	if ( ! actionStatus ) {
		return null;
	}

	return (
		<Grid container alignItems="center" key={ name }>
			<Checkbox rounded checked onChange={ () => {} } />

			<Text tag="span" className="e-app-import-plugins-activation__plugin-name">
				{ name + ' ' + actionStatus }
			</Text>
		</Grid>
	);
}

PluginStatusItem.propTypes = {
	name: PropTypes.string.isRequired,
	slug: PropTypes.string.isRequired,
	status: PropTypes.string.isRequired,
	onReady: PropTypes.func.isRequired,
};
