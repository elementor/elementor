import React, { useContext } from 'react';

import { ImportContext } from '../../../../../context/import-context/import-context-provider';

import Box from 'elementor-app/ui/atoms/box';
import List from 'elementor-app/ui/molecules/list';
import TemplatesConflict from './template-conflict';
import HomepageConflict from './homepage-conflict';

function ConflictList() {
    const importContext = useContext( ImportContext ),
        conflicts = importContext.data?.uploadedData?.conflicts,
        homepageConflict = conflicts?.homepage;
        // templateConflicts = conflicts?.templates || {};

    // This code prevent the dependency of Elementor-Pro.
    // Delete this code and use the code above when Elementor-Pro will be dependent on Elementor V3.8.
    delete conflicts.homepage;
    const templatesConflicts = conflicts?.templates || conflicts || {};

    return (
        <Box className="e-app-import-resolver-conflicts__container">
            <List separated className="e-app-import-resolver-conflicts">

                { homepageConflict &&
                <List.Item padding="20" key={ -1 } className="e-app-import-resolver-conflicts__item">
                    <HomepageConflict conflictData={ homepageConflict } />
                </List.Item>
                }

                { Object.entries( templatesConflicts ).map( ( [ id, conflict ], index ) => (
                    <List.Item padding="20" key={ index } className="e-app-import-resolver-conflicts__item">
                        <TemplatesConflict importedId={ parseInt( id ) } conflictData={ conflict[ 0 ] } />
                    </List.Item>
                ) ) }
            </List>
        </Box>
    );
}

export default ConflictList;
