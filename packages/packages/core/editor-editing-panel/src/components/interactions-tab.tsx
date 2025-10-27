import * as React from 'react';
import { SwipeIcon } from '@elementor/icons';
import { Button, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useElement } from '../contexts/element-context';
import { SectionsList } from './sections-list';
import { InteractionsSection } from '../components/interactions-sections/interactions-section';



export const InteractionsTab = () => {
     const { elementType, element } = useElement();
    
	return (
    <SessionStorageProvider prefix={ element.id }>
		<Stack
			alignItems="center"
			justifyContent="center"
			height="100%"
			color="text.secondary"
			sx={ { p: 2.5, pt: 8, pb: 5.5 } }
			gap={ 1.5 }
		>
			<SwipeIcon fontSize="large" />

			<Typography align="center" variant="subtitle2">
				{ __( 'Animate elements with Interactions', 'elementor' ) }
			</Typography>

			<Typography align="center" variant="caption" maxWidth="170px">
				{ __(
					'Add entrance animations and effects triggered by user interactions such as click, hover, or scroll.',
					'elementor'
				) }
			</Typography>

			<Button variant="outlined" color="secondary" size="small" sx={ { mt: 1 } }>
				{ __( 'Create an interaction', 'elementor' ) }
			</Button>
		</Stack>
    
           
						<SectionsList>
							<InteractionsSection />
						</SectionsList>
						
        </SessionStorageProvider>
	);
};
