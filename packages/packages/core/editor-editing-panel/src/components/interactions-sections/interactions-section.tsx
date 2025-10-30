import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { SectionContent } from '../section-content';
import { InteractionsProvider } from '../../contexts/interaction-context';
import { InteractionsInput } from './interactions-input';

const INTERACTIONS_LABEL = __( 'Interactions', 'elementor' );

export const InteractionsSection = () => {
    return (
        <SectionContent>
            <InteractionsProvider>
                <InteractionsInput />
            </InteractionsProvider>
        </SectionContent>
    );
}; 