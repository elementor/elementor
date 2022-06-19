import { useNavigate } from '@reach/router';

import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

export default function ImportContentFooter( { hasPlugins, hasConflicts, isImportAllowed, onResetProcess } ) {
	const navigate = useNavigate(),
		getNextPageUrl = () => {
			if ( hasConflicts ) {
				return 'import/resolver';
			} else if ( hasPlugins ) {
				return 'import/plugins-activation';
			}

			return 'import/process';
		};

	return (
		<ActionsFooter>
			<Button
				text={ __( 'Previous', 'elementor' ) }
				variant="contained"
				onClick={ () => {
					if ( hasPlugins ) {
						navigate( 'import/plugins/' );
					} else {
						onResetProcess();
					}
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Import', 'elementor' ) }
				color={ isImportAllowed ? 'primary' : 'disabled' }
				onClick={ () => isImportAllowed && navigate( getNextPageUrl() ) }
			/>
		</ActionsFooter>
	);
}

ImportContentFooter.propTypes = {
	hasPlugins: PropTypes.bool,
	hasConflicts: PropTypes.bool,
	isImportAllowed: PropTypes.bool,
	onResetProcess: PropTypes.func.isRequired,
};
