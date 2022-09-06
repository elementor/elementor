import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

export default function ExportPluginsFooter( { isKitReady } ) {
	return (
		<ActionsFooter>
			<Button
				text={ __( 'Back', 'elementor' ) }
				variant="contained"
				url="/export"
			/>

			<Button
				text={ __( 'Create Kit', 'elementor' ) }
				variant="contained"
				color={ isKitReady ? 'primary' : 'disabled' }
				url={ isKitReady ? '/export/process' : '' }
			/>
		</ActionsFooter>
	);
}

ExportPluginsFooter.propTypes = {
	isKitReady: PropTypes.bool.isRequired,
};
