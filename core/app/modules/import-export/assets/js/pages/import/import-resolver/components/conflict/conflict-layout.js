import { useState, useEffect } from 'react';

import Checkbox from 'elementor-app/ui/atoms/checkbox';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';
import Grid from 'elementor-app/ui/grid/grid';
import Button from 'elementor-app/ui/molecules/button';

export default function ConflictLayout( { conflictTitle, importTitle, exportTitle, editUrl, onChecked } ) {
	const [ checked, setChecked ] = useState( true ),

    handleCheckbox = () => setChecked( ! checked );

    useEffect( () => {
		onChecked( checked );
	}, [ checked ] );

	return (
		<Grid container noWrap>
            <Checkbox
				checked={ checked }
				onChange={ handleCheckbox }
				className="e-app-import-resolver-conflicts__checkbox"
			/>

			<Grid item>
				<Heading variant="h5" tag="h4" className="e-app-import-resolver-conflicts__title">
					{ conflictTitle }
				</Heading>

				<Grid item>
					<Text variant="sm" tag="span" className={ `e-app-import-resolver-conflicts__asset ${ checked ? 'active' : '' }` }>
						{ __( 'Imported' ) }: { importTitle }
					</Text>

					<Text style variant="sm" tag="span" className={ `e-app-import-resolver-conflicts__asset ${ ! checked ? 'active' : '' }` }>
						{ __( 'Existing' ) }: { exportTitle }
                        { editUrl && <Button
                            className="e-app-import-resolver-conflicts__edit-template"
                            url={ editUrl }
                            target="_blank"
                            icon="eicon-editor-external-link"
                            text={ __( 'Edit Homepage', 'elementor' ) }
                            hideText
                        /> }
					</Text>
				</Grid>
			</Grid>
		</Grid>
	);
}

ConflictLayout.propTypes = {
    conflictTitle: PropTypes.string.isRequired,
    importTitle: PropTypes.string.isRequired,
    exportTitle: PropTypes.string.isRequired,
    editUrl: PropTypes.string,
    onChecked: PropTypes.func.isRequired,
};
