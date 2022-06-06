import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import ConflictLayout from './conflict-layout';

export default function TemplateConflict( { conflictData, importedId } ) {
	const importContext = useContext( ImportContext ),
		manifest = importContext.data.uploadedData?.manifest,

	getConflictTitle = ( id ) => {
		const templateType = manifest.templates[ id ].doc_type,
			summaryTitle = elementorAppConfig[ 'import-export' ].summaryTitles.templates?.[ templateType ];

		return summaryTitle?.single || templateType;
	},

	handleOnChecked = ( checked ) => {
		const actionType = checked ? 'ADD_OVERRIDE_CONDITION' : 'REMOVE_OVERRIDE_CONDITION';

		importContext.dispatch( { type: actionType, payload: importedId } );
	};

	return (
		<ConflictLayout
			conflictTitle={ getConflictTitle( importedId ) }
			importTitle={ manifest.templates[ importedId ].title }
			exportTitle={ conflictData.template_title }
			editUrl={ conflictData.edit_url }
			onChecked={ handleOnChecked }
		/>
	);
}

TemplateConflict.propTypes = {
	importedId: PropTypes.number.isRequired,
	conflictData: PropTypes.object.isRequired,
};
