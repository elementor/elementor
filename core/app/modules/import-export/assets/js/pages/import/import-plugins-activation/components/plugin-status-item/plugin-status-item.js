import { useState, useEffect } from 'react';

import usePlugins from '../../../../../hooks/use-plugins';

import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Text from 'elementor-app/ui/atoms/text';

export default function PluginStatusItem( { name, slug, status, onReady } ) {
	const [ actionStatus, setActionStatus ] = useState( '' ),
		{ pluginsState, pluginsActions, PLUGINS_STATUS_MAP } = usePlugins();

	console.log( '--- RE-RENDER OF: ', name );

	// Activating or installing the plugin, depending on the current plugin status.
	useEffect( () => {
		const action = 'inactive' === status ? 'activate' : 'install';

		if ( 'media-cleaner/media-cleaner' === slug ) {
			slug = 'medsgfdsfd/dsfsdfsdf';
		}

		pluginsActions[ action ]( slug );
	}, [] );

	useEffect( () => {
		if ( PLUGINS_STATUS_MAP.SUCCESS === pluginsState.status ) {
			if ( ! pluginsState.data.hasOwnProperty( 'plugin' ) ) {
				setActionStatus( 'failed' );
			} else if ( 'active' === pluginsState.data.status ) {
				setActionStatus( 'activated' );
			} else if ( 'inactive' === pluginsState.data.status ) {
				/*
					In case that the widget was installed it will be inactive after the installation.
					Therefore, the actions should be reset and the plugin should be activated.
				 */
				setActionStatus( 'installed' );

				pluginsActions.reset();

				pluginsActions.activate( slug );
			}
		}
	}, [ pluginsState.status ] );

	useEffect( () => {
		if ( 'activated' === actionStatus || 'failed' === actionStatus ) {
			onReady( name, actionStatus );
		}
	}, [ actionStatus ] );

	if ( ! actionStatus ) {
		return null;
	}

	return (
		<Grid container alignItems="center" key={ name }>
			<Checkbox rounded checked error={ 'failed' === actionStatus || null } onChange={ () => {} } />

			<Text tag="span" variant="sm" className="e-app-import-plugins-activation__plugin-name">
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
