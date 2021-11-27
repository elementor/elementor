import { useState } from 'react';

import Layout from '../../../templates/layout';
import FileProcess from '../../../shared/file-process/file-process';

export default function ImportPluginsActivation() {
	const [ errorType, setErrorType ] = useState( '' ),
		onCancelProcess = () => {
			// context.dispatch( { type: 'SET_FILE', payload: null } );
			//
			// if ( 'kit-library' === referrer ) {
			// 	navigate( '/kit-library' );
			// } else {
			// 	navigate( '/import' );
			// }
		};

	return (
		<Layout type="import">
			<section>
				<FileProcess errorType={ errorType } onDialogDismiss={ onCancelProcess } />

			</section>
		</Layout>
	);
}
