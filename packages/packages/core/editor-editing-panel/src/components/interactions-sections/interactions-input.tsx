import * as React from 'react';
import { TextField } from '@elementor/ui';
import { useInteractionsContext } from '../../contexts/interaction-context';

export const InteractionsInput = () => {
    const { interactions, setInteractions } = useInteractionsContext();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInteractions(event.target.value);
    };

    return (
        <TextField
            label="Animation"
            value={interactions}
            onChange={handleChange}
            placeholder="e.g. fade-in-left"
            fullWidth
            size="small"
        />
    );
};