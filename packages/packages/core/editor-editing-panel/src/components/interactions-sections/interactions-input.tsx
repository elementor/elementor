import * as React from 'react';
import { 
    UnstableTag, 
    Popover, 
    Box, 
    Stack, 
    Typography, 
    IconButton,
    Tooltip,
    MenuItem,
    ListItemText
} from '@elementor/ui';
import { 
    CirclePlusIcon, 
    CircleXIcon, 
    ChevronDownIcon,
    CopyIcon,
} from '@elementor/icons';
import { bindTrigger, bindPopover, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import { useInteractionsContext } from '../../contexts/interaction-context';

const ANIMATION_OPTIONS = [
    { value: '', label: 'Select animation...' },
    { value: 'pageload-fade-in-left-1000-1000', label: 'Page Load - Fade In Left' },
    { value: 'scrollintoview-fade-in-left-1000-1000', label: 'Scroll Into View - Fade In Left' },
    { value: 'scrolloutofview-fade-out-right-1000-1000', label: 'Scroll Out of View - Fade Out Right' },
    { value: 'pageload-slide-in-up-1000-1000', label: 'Page Load - Slide In Up' },
    { value: 'scrollintoview-slide-in-up-1000-1000', label: 'Scroll Into View - Slide In Up' },
    { value: 'scrolloutofview-slide-out-down-1000-1000', label: 'Scroll Out of View - Slide Out Down' },
    { value: 'pageload-scale-in-1000-1000', label: 'Page Load - Scale In' },
    { value: 'scrollintoview-scale-in-1000-1000', label: 'Scroll Into View - Scale In' },
    { value: 'scrolloutofview-scale-out-1000-1000', label: 'Scroll Out of View - Scale Out' },
];

export const InteractionsInput = () => {
    const { interactions, setInteractions } = useInteractionsContext();

    // Parse current interactions to get animation IDs
    const currentAnimationIds = React.useMemo(() => {
        try {
            const parsed = JSON.parse(interactions || '[]');
            if (Array.isArray(parsed)) {
                return parsed.map(item => 
                    typeof item === 'string' ? item : item?.animation?.animation_id || ''
                );
            }
            return [];
        } catch {
            return [];
        }
    }, [interactions]);

    const handleAddInteraction = () => {
        const newAnimationIds = [...currentAnimationIds, ''];
        // Convert to full object structure for database
        const newInteractions = newAnimationIds.map(animationId => ({
            animation: {
                animation_type: 'full-preset',
                animation_id: animationId
            }
        }));
        setInteractions(JSON.stringify(newInteractions));
    };

    const handleRemoveInteraction = (index: number) => {
        const newAnimationIds = currentAnimationIds.filter((_, i) => i !== index);
        // Convert to full object structure for database
        const newInteractions = newAnimationIds.map(animationId => ({
            animation: {
                animation_type: 'full-preset',
                animation_id: animationId
            }
        }));
        setInteractions(JSON.stringify(newInteractions));
    };

    const handleChangeInteraction = (index: number, value: string) => {
        const newAnimationIds = [...currentAnimationIds];
        newAnimationIds[index] = value;
        // Convert to full object structure for database
        const newInteractions = newAnimationIds.map(animationId => ({
            animation: {
                animation_type: 'full-preset',
                animation_id: animationId
            }
        }));
        setInteractions(JSON.stringify(newInteractions));
    };

    const handleDuplicateInteraction = (index: number) => {
        const animationId = currentAnimationIds[index];
        const newAnimationIds = [...currentAnimationIds];
        newAnimationIds.splice(index + 1, 0, animationId);
        // Convert to full object structure for database
        const newInteractions = newAnimationIds.map(animationId => ({
            animation: {
                animation_type: 'full-preset',
                animation_id: animationId
            }
        }));
        setInteractions(JSON.stringify(newInteractions));
    };

    return (
        <Stack spacing={1}>
            {/* Header */}
            <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ marginInlineEnd: -0.75, py: 0.25 }}
            >
                <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
                    <Typography component="label" variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                        {__('Interactions', 'elementor')}
                    </Typography>
                </Box>
                <Tooltip title={__('Add interaction', 'elementor')} placement="top">
                    <IconButton
                        size="tiny"
                        onClick={handleAddInteraction}
                        aria-label={__('Add interaction', 'elementor')}
                    >
                        <CirclePlusIcon fontSize="tiny" />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Items */}
            <Stack spacing={0.5}>
                {currentAnimationIds.map((animationId, index) => (
                    <InteractionItem
                        key={index}
                        index={index}
                        animationId={animationId}
                        onChange={handleChangeInteraction}
                        onRemove={handleRemoveInteraction}
                        onDuplicate={handleDuplicateInteraction}
                        canRemove={currentAnimationIds.length > 1}
                    />
                ))}
            </Stack>
        </Stack>
    );
};

// Individual interaction item component
const InteractionItem = ({ 
    index, 
    animationId, 
    onChange, 
    onRemove, 
    onDuplicate, 
    canRemove 
}: {
    index: number;
    animationId: string;
    onChange: (index: number, value: string) => void;
    onRemove: (index: number) => void;
    onDuplicate: (index: number) => void;
    canRemove: boolean;
}) => {
    const popoverState = usePopupState({ variant: 'popover' });
    
    const selectedOption = ANIMATION_OPTIONS.find(option => option.value === animationId);
    const displayLabel = selectedOption?.label || 'Select animation...';
    const isShowingPlaceholder = !animationId;

    const handleSelect = (value: string) => {
        onChange(index, value);
        popoverState.close();
    };

    return (
        <>
            <UnstableTag
                variant="outlined"
                label={displayLabel}
                endIcon={<ChevronDownIcon fontSize="tiny" />}
                {...bindTrigger(popoverState)}
                fullWidth
                showActionsOnHover
                sx={{
                    minHeight: (theme) => theme.spacing(3.5),
                    ...(isShowingPlaceholder && {
                        '& .MuiTag-label': {
                            color: (theme) => theme.palette.text.tertiary,
                        },
                    }),
                }}
                actions={
                    <>
                        <Tooltip title={__('Duplicate', 'elementor')} placement="top">
                            <IconButton
                                size="tiny"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDuplicate(index);
                                }}
                                aria-label={__('Duplicate', 'elementor')}
                            >
                                <CopyIcon fontSize="tiny" />
                            </IconButton>
                        </Tooltip>
                        {canRemove && (
                            <Tooltip title={__('Remove', 'elementor')} placement="top">
                                <IconButton
                                    size="tiny"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(index);
                                    }}
                                    aria-label={__('Remove', 'elementor')}
                                    color="error"
                                >
                                    <CircleXIcon fontSize="tiny" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </>
                }
            />

            <Popover
                disablePortal
                slotProps={{
                    paper: {
                        sx: { 
                            mt: 0.5, 
                            minWidth: 200,
                            maxHeight: 300,
                            overflow: 'auto'
                        },
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                {...bindPopover(popoverState)}
            >
                <Box sx={{ p: 1 }}>
                    {ANIMATION_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            value={option.value}
                            onClick={() => handleSelect(option.value)}
                            selected={option.value === animationId}
                            sx={{
                                minHeight: 32,
                                fontSize: '0.75rem',
                                '&.Mui-selected': {
                                    backgroundColor: 'action.selected',
                                },
                            }}
                        >
                            <ListItemText 
                                primary={option.label}
                                primaryTypographyProps={{
                                    variant: 'caption',
                                    color: option.value === animationId ? 'primary' : 'text.primary'
                                }}
                            />
                        </MenuItem>
                    ))}
                </Box>
            </Popover>
        </>
    );
};