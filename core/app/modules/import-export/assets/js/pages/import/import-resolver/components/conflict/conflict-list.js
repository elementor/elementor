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

    // This code prevent the dependency of Elementor-Pro.
    // Before, we refer to conflicts only as template conflicts,
    // But now we need to support homepage conflicts and in the future, we need to support other conflicts.
    // When Elementor Pro will be dependent on Elementor-Core 3.8, we will no longer need to do this check.
    const templatesConflicts = conflicts?.templates || conflicts || {};
    delete templatesConflicts.homepage;

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
