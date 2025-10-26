import * as React from 'react';
import { Select, MenuItem } from '@elementor/ui';
import { useInteractionsContext } from '../../contexts/interaction-context';

const TRIGGER_OPTIONS = [
    { value: '', label: 'Select trigger...' },
    { value: 'page-load', label: 'On Page Load' },
    { value: 'scroll-into-view', label: 'Scroll Into View' },
    { value: 'scroll-out-of-view', label: 'Scroll Out of View' }
];

export const InteractionsInput = () => {
    const { interactions, setInteractions } = useInteractionsContext();

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedValue = event.target.value as string;
        
        if (selectedValue === '') {
            // Empty selection - send empty array as JSON string
            setInteractions('[]');
        } else {
            // Save as single-item array, but as JSON string
            setInteractions(JSON.stringify([selectedValue]));
        }
    };

    // For display, parse the JSON string back to get first item
    const currentValue = (() => {
        try {
            const parsed = JSON.parse(interactions || '[]');
            return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
        } catch {
            return '';
        }
    })();

    return (
        <Select
            value={currentValue}
            onChange={handleChange}
            displayEmpty
            fullWidth
            size="small"
        >
            {TRIGGER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
};