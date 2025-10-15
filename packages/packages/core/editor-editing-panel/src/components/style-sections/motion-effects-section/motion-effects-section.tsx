import * as React from 'react';
import { motionEffectsPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';
import { SettingsField } from '../../../controls-registry/settings-field';
import { SectionContent } from '../../section-content';

import { MotionEffectsRepeaterControl } from './motion-effects-repeater-control';

const MOTION_EFFECTS_LABEL = __( 'Motion Effects', 'elementor' );

export const MotionEffectsSection = () => {
    return (
        <SectionContent>
            <SettingsField bind="motion-effects" propDisplayName={ MOTION_EFFECTS_LABEL }>
                <MotionEffectsRepeaterControl />
            </SettingsField>
        </SectionContent>
    );
}; 