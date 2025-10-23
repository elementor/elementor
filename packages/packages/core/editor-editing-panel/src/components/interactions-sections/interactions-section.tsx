import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { InteractionsField } from '../../controls-registry/interactions-field';
import { SectionContent } from '../section-content';
import { InteractionsProvider } from '../../contexts/interaction-context';
import { InteractionsInput } from './interactions-input';

const INTERACTIONS_LABEL = __( 'Interactions', 'elementor' );

export const InteractionsSection = () => {
    return (
        // <SectionContent>
        //     <InteractionsField bind="interactions" propDisplayName={ INTERACTIONS_LABEL }>
        //         <TextControl
        //             placeholder="e.g. fade-in-left"
        //         />
        //     </InteractionsField>
        // </SectionContent>
        <SectionContent>
            <InteractionsProvider>
                <InteractionsInput />
            </InteractionsProvider>
        </SectionContent>
    );
}; 