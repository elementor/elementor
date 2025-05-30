import { useContext } from 'react';

import { ExportContext } from '../../../../../context/export-context/export-context-provider';
import { KIT_SOURCE_MAP } from '../../../../../hooks/use-kit';
import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import './export-plugins-footer.scss';

export default function ExportPluginsFooter( { isKitReady } ) {
	const exportContext = useContext( ExportContext );

	const isCloudKitFeatureActive = Boolean( elementorCommon?.config?.experimentalFeatures?.e_cloud_library_kits );

	return (
		<ActionsFooter className="e-app-export-actions-container" >
			<Button
				text={ __( 'Back', 'elementor' ) }
				variant="contained"
				url="/export"
			/>

			{
				isCloudKitFeatureActive && (
					<Button
						text={ __( 'Add Kit to Cloud', 'elementor' ) }
						variant="outlined"
						color={ isKitReady ? 'secondary' : 'disabled' }
						url={ isKitReady ? '/export/process' : '' }
						onClick={ () => {
							exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.CLOUD } );
						} }
					/>
				)
			}

			<Button
				text={ __( 'Export as Zip', 'elementor' ) }
				variant="contained"
				color={ isKitReady ? 'primary' : 'disabled' }
				url={ isKitReady ? '/export/process' : '' }
				onClick={ () => {
					exportContext.dispatch( { type: 'SET_KIT_SAVE_SOURCE', payload: KIT_SOURCE_MAP.FILE } );
				} }
			/>
		</ActionsFooter>
	);
}

ExportPluginsFooter.propTypes = {
	isKitReady: PropTypes.bool.isRequired,
};
