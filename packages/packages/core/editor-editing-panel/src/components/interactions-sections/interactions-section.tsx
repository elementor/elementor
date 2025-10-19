import * as React from 'react';
// import { motionEffectsPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';
import { SettingsField } from '../../controls-registry/settings-field';
import { SectionContent } from '../section-content';

import { InteractionsRepeaterControl } from './interactions-repeater';

const INTERACTIONS_LABEL = __( 'Interactions', 'elementor' );

export const InteractionsSection = () => {
    return (
        <SectionContent>
            <div>Empty Interactions Section</div>
            {/* <SettingsField bind="interactions" propDisplayName={ INTERACTIONS_LABEL }>
                <InteractionsRepeaterControl />
            </SettingsField> */}
        </SectionContent>
    );
}; 