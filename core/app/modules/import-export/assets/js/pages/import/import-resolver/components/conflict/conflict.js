import { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';
import { SharedContext } from '../../../../../context/shared-context/shared-context-provider';

import ConflictCheckbox from './components/conflict-checkbox/conflict-checkbox';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

export default function Conflict( props ) {
	const importContext = useContext( ImportContext ),
		sharedContext = useContext( SharedContext ),
		manifest = importContext.data.uploadedData?.manifest,
		{ referrer, wizardStepNum } = sharedContext.data,
		getConflictTitle = ( id ) => {
			const templateType = manifest.templates[ id ].doc_type,
				summaryTitle = elementorAppConfig[ 'import-export' ].summaryTitles.templates?.[ templateType ];

			return summaryTitle?.single || templateType;
		},
		getEditTemplateButton = ( editUrl, title ) => (
			<Button
				className="e-app-import-resolver-conflicts__edit-template"
				url={ editUrl }
				target="_blank"
				icon="eicon-editor-external-link"
				text={ __( 'Edit Template', 'elementor' ) }
				hideText
				onClick={ () => {
					if ( 'kit-library' === referrer && props.viewConflictItemEvent ) {
						props.viewConflictItemEvent( title );
					}
				} }
			/>
		),
		isImportedAssetSelected = ( importedAssetId ) => importContext.data.overrideConditions.includes( importedAssetId ),
		getAssetClassName = ( isActive ) => {
			const classes = [ 'e-app-import-resolver-conflicts__asset' ];

			if ( isActive ) {
				classes.push( 'active' );
			}

			return classes.join( ' ' );
		},
		getImportedAssetClasses = ( importedAssetId ) => getAssetClassName( isImportedAssetSelected( importedAssetId ) ),
		getExistingAssetClasses = ( importedAssetId ) => getAssetClassName( ! isImportedAssetSelected( importedAssetId ) );

	return (
		<Grid container noWrap>
			<ConflictCheckbox
				id={ props.importedId }
				type="main-type"
				className="e-app-import-resolver-conflicts__checkbox"
				title={ props.conflictData.template_title }
				referrer={ referrer }
				onCheck={ ( event, title ) => {
					const command = event.target.checked ? 'kit-library/check' : 'kit-library/uncheck';
					$e.run(
						command,
						{
							site_part: title,
						},
						{
							meta: {
								action: command,
								event: 'kit parts conflict',
								source: 'import',
								step: wizardStepNum,
							},
						},
					);
				} }
			/>

			<Grid item>
				<Heading variant="h5" tag="h4" className="e-app-import-resolver-conflicts__title">
					{ getConflictTitle( props.importedId ) }
				</Heading>

				<Grid item>
					<Text variant="sm" tag="span" className={ getImportedAssetClasses( props.importedId ) }>
						{ __( 'Imported', 'elementor' ) }: { manifest.templates[ props.importedId ].title }
					</Text>

					<Text style variant="sm" tag="span" className={ getExistingAssetClasses( props.importedId ) }>
						{ __( 'Existing', 'elementor' ) }: { props.conflictData.template_title } { getEditTemplateButton( props.conflictData.edit_url, props.conflictData.template_title ) }
					</Text>
				</Grid>
			</Grid>
		</Grid>
	);
}

Conflict.propTypes = {
	importedId: PropTypes.number,
	conflictData: PropTypes.object,
	viewConflictItemEvent: PropTypes.func,
};
