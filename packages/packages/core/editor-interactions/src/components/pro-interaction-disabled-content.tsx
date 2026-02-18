import * as React from 'react';
import { useState, useRef } from 'react';
import { Box, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { InteractionsPromotionChip } from '../ui/interactions-promotion-chip';
import type { InteractionItemPropValue } from '../types';
import { PromotionPopover } from '@elementor/editor-ui';
import { buildDisplayLabel } from '../utils/prop-value-utils';

export const ProInteractionDisabledContent = ({ value }: { value: InteractionItemPropValue }) => {
    const [ isOpen, setIsOpen ] = useState( false );
    const anchorRef = useRef<HTMLElement | null>(null);
    return (
       
        <PromotionPopover
        open={ isOpen }
        content={__('This interaction is currently inactive and not showing on your website. Activate your Pro plugin to use it again.', 'elementor')}
     
    title={ __( 'Interactions', 'elementor' ) }
			
			ctaText={ __( 'Upgrade now', 'elementor' ) }
			ctaUrl={ 'https://go.elementor.com/go-pro-interactions/' }
            onClose={ () => setIsOpen( false ) }
            anchorRef={anchorRef}
            // anchorRef={anchorRef}
            // anchorRef={ anchorRef }
			placement={ anchorRef ? 'right-start' : undefined }
            
        >     <Box
        ref={anchorRef}
        onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
        }}
        sx={{ cursor: 'pointer' }}
    >
        {buildDisplayLabel(value.value)}
    </Box>
        </PromotionPopover>
          
    );
};