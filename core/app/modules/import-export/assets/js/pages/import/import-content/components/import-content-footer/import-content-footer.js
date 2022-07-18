import { useContext } from 'react';
import { useNavigate } from '@reach/router';
import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';
import { SharedContext } from 'elementor/core/app/modules/import-export/assets/js/context/shared-context/shared-context-provider';

export default function ImportContentFooter( { hasPlugins, hasConflicts, isImportAllowed, onResetProcess } ) {
	const sharedContext = useContext( SharedContext ),
	{ referrer } = sharedContext.data,
	navigate = useNavigate(),
		getNextPageUrl = () => {
			if ( hasConflicts ) {
				return 'import/resolver';
			} else if ( hasPlugins ) {
				return 'import/plugins-activation';
			}

			return 'import/process';
		};

		const eventTrack = ( action ) => {
			$e.run( action );
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
					if ( 'kit-library' === referrer ) {
						elementorCommon.events.eventTracking(
							'kit-library/go-back',
							{
								placement: 'kit library',
								event: 'previous button',
							},
							{
								source: 'import',
								step: '2',
							},
						)
					}
				} }
			/>

			<Button
				variant="contained"
				text={ __( 'Import', 'elementor' ) }
				color={ isImportAllowed ? 'primary' : 'disabled' }
				onClick={ () => {
					if ( 'kit-library' === referrer ) {
						elementorCommon.events.eventTracking(
							'kit-library/approve-import',
							{
								placement: 'kit library',
								event: 'approve import',
							},
							{
								source: 'import',
								step: '2',
							},
						)
					}
					return isImportAllowed && navigate( getNextPageUrl() );
				} }
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
