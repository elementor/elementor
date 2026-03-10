import * as React from 'react';

import { t } from '../../utils/translations';
import { SITE_ABOUT_OPTIONS } from './constants';
import { OptionCard } from './option-card';
import { CardGrid } from './styled-components';

interface OptionsGridProps {
	selectedValues: string[];
	onToggle: ( value: string ) => void;
}

export function OptionsGrid( { selectedValues, onToggle }: OptionsGridProps ) {
	return (
		<CardGrid>
			{ SITE_ABOUT_OPTIONS.map( ( option ) => (
				<OptionCard
					key={ option.value }
					label={ t( option.labelKey ) }
					icon={ option.icon }
					selected={ selectedValues.includes( option.value ) }
					onClick={ () => onToggle( option.value ) }
				/>
			) ) }
		</CardGrid>
	);
}
