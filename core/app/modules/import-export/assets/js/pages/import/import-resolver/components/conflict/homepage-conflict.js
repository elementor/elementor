import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import ConflictLayout from './conflict-layout';

export default function HomepageConflict( { conflictData } ) {
	const importContext = useContext( ImportContext ),
		manifest = importContext.data.uploadedData?.manifest,

	handleOnChecked = ( checked ) => importContext.dispatch( { type: 'SET_OVERRIDE_HOMEPAGE', payload: checked ? conflictData.imported_id : null } );

	return (
		<ConflictLayout
			conflictTitle={ __( 'Homepage' ) }
			importTitle={ manifest.content.page[ conflictData.imported_id ].title }
			exportTitle={ conflictData.title }
			editUrl={ conflictData.edit_url }
			onChecked={ handleOnChecked }
		/>
	);
}

HomepageConflict.propTypes = {
	conflictData: PropTypes.object.isRequired,
};
