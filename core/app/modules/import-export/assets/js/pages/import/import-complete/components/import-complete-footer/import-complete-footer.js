import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import useImportActions from '../../../hooks/use-import-actions';

export default function ImportCompleteFooter( { seeItLiveUrl } ) {
	const { closeApp } = useImportActions();
	return (
		<ActionsFooter>
			{
				seeItLiveUrl &&
				<Button
					text={ __( 'See it live', 'elementor' ) }
					variant="contained"
					onClick={ () => window.open( seeItLiveUrl, '_blank' ) }
				/>
			}

			<Button
				text={ __( 'Close', 'elementor' ) }
				variant="contained"
				color="primary"
				onClick={ closeApp }
			/>
		</ActionsFooter>
	);
}

ImportCompleteFooter.propTypes = {
	seeItLiveUrl: PropTypes.string,
};
