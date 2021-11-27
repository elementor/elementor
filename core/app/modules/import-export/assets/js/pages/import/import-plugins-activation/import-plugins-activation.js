import { useState, useContext, useEffect } from 'react';

import { Context } from '../../../context/context-provider';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

import Grid from 'elementor-app/ui/grid/grid';
import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import List from 'elementor-app/ui/molecules/list';

import './import-plugins-activation.scss';

export default function ImportPluginsActivation() {
	const context = useContext( Context ),
		[ errorType, setErrorType ] = useState( '' ),
		onCancelProcess = () => {
			// context.dispatch( { type: 'SET_FILE', payload: null } );
			//
			// if ( 'kit-library' === referrer ) {
			// 	navigate( '/kit-library' );
			// } else {
			// 	navigate( '/import' );
			// }
		};

	useEffect( () => {
		if ( context.data.plugins.length ) {

		}
	}, [ context.data.plugins ] );

	return (
		<Layout type="import">
			<section className="e-app-import-plugins-activation">
				<FileProcess errorType={ errorType } onDialogDismiss={ onCancelProcess } />

				<Grid container justify="center">
					<Grid item className="e-app-import-plugins-activation__installing-plugins">
						<Heading className="e-app-import-plugins-activation__heading" variant="h3" tag="h3">
							{ __( 'Installing plugins:', 'elementor' ) }
						</Heading>

						<List>
							<List.Item>
								<Grid container alignItems="center">
									<Checkbox rounded checked />
									<Text tag="span" className="e-app-import-plugins-activation__plugin-name">
										{ 'Woocommerce' + ' ' + 'installed' }
									</Text>
								</Grid>
							</List.Item>
						</List>
					</Grid>
				</Grid>
			</section>
		</Layout>
	);
}
