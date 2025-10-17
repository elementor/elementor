import * as React from 'react';
import { TextField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useBoundProp } from '@elementor/editor-controls';

export const MotionEffectControl = () => {
	const { value, setValue } = useBoundProp();
	
	// Create a display string from the object
	const displayValue = value ? 
		`${value.trigger || 'scroll-into-view'}, ${value.animation || 'fade'}, ${value.type || 'in'}, ${value.direction || 'left'}` :
		'scroll-into-view, fade, in, left';
	
	const handleChange = ( event: React.ChangeEvent<HTMLInputElement> ) => {
		// For testing, just keep the default structure
		setValue({
			trigger: 'scroll-into-view',
			animation: 'fade',
			type: 'in',
			direction: 'left',
		});
	};
	
	return (
		<TextField
			value={ displayValue }
			onChange={ handleChange }
			placeholder="scroll-into-view, fade, in, left"
			size="tiny"
			fullWidth
			readOnly
		/>
	);
};
