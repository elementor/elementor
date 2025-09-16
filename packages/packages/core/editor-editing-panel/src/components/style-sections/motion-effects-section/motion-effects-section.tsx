import * as React from 'react';
import { TextField } from '@elementor/ui';
import { motionEffectsPropTypeUtil } from '@elementor/editor-props';
import { __ } from '@wordpress/i18n';
import { SettingsField } from '../../../controls-registry/settings-field';
import { SectionContent } from '../../section-content';
import { useBoundProp } from '@elementor/editor-controls';

const MOTION_EFFECTS_LABEL = __( 'Motion Effects', 'elementor' );

const SimpleMotionEffectsControl = () => {
    const { value, setValue, disabled } = useBoundProp(motionEffectsPropTypeUtil);
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };
    
    return (
        <TextField
            value={value || ''}
            onChange={handleChange}
            placeholder="Type 'yes' to enable motion effects"
            size="tiny"
            fullWidth
            disabled={disabled}
        />
    );
};

export const MotionEffectsSection = () => {
    return (
        <SectionContent>
            <SettingsField bind="motion-effects" propDisplayName={ MOTION_EFFECTS_LABEL }>
                <SimpleMotionEffectsControl />
            </SettingsField>
        </SectionContent>
    );
}; 