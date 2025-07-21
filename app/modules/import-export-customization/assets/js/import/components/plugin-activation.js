import { Stack } from '@elementor/ui';
import PropTypes from 'prop-types';
import { useImportContext } from '../context/import-context';
import PluginStatusItem from './plugin-status-item';
export function PluginActivation( { plugins } ) {
	const { data } = useImportContext();

	return (
		<Stack>
			{ data.uploadedData?.manifest?.plugins?.map( ( plugin ) => {
				let status = '';

				if ( ! plugins?.length ) {
					status = 'activating';
				} else if ( plugins?.includes( plugin.name ) ) {
					status = 'activated';
				}

				return (
					<PluginStatusItem
						key={ plugin.name }
						name={ plugin.name }
						status={ status }
					/>
				);
			} ) }
		</Stack>
	);
}

PluginActivation.propTypes = {
	plugins: PropTypes.arrayOf( PropTypes.string ),
};
