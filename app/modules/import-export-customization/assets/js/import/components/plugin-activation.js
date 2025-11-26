import { Box, Stack, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';
import { __ } from '@wordpress/i18n';
import { useImportContext } from '../context/import-context';
import PluginStatusItem from './plugin-status-item';

export function PluginActivation( { plugins } ) {
	const { data } = useImportContext();

	const pluginsToActivate = data.uploadedData?.manifest?.plugins
		?.filter( ( plugin ) => {
			if ( data?.customization?.plugins ) {
				return true === data.customization.plugins[ plugin.plugin ];
			}
			return true;
		} ) || [];

	if ( ! pluginsToActivate.length ) {
		return null;
	}

	let pluginsArray = [];
	if ( Array.isArray( plugins ) ) {
		pluginsArray = plugins;
	} else if ( plugins && 'object' === typeof plugins ) {
		pluginsArray = Object.values( plugins );
	}

	return (
		<Box>
			<Typography variant="subtitle1" color="text.secondary" sx={ { mb: 2 } }>
				{ __( 'Activating plugins:', 'elementor' ) }
			</Typography>
			<Box
				sx={ {
					width: '100%',
					maxWidth: 500,
					borderRadius: 1,
					border: 1,
					borderColor: 'action.focus',
					p: 2.5,
					maxHeight: 300,
					overflow: 'auto',
				} }
			>
				<Stack spacing={ 1.5 }>
					{ pluginsToActivate.map( ( plugin ) => {
						const isActivated = pluginsArray.includes( plugin.name );

						return (
							<PluginStatusItem
								key={ plugin.name }
								name={ plugin.name }
								status={ isActivated ? 'activated' : 'activating' }
							/>
						);
					} ) }
				</Stack>
			</Box>
		</Box>
	);
}

PluginActivation.propTypes = {
	plugins: PropTypes.arrayOf( PropTypes.string ),
};
