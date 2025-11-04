import * as React from 'react';
import { ChevronDownIcon, CirclePlusIcon, CircleXIcon, CopyIcon } from '@elementor/icons';
import {
	bindPopover,
	bindTrigger,
	Box,
	IconButton,
	ListItemText,
	MenuItem,
	Popover,
	Stack,
	Tooltip,
	Typography,
	UnstableTag,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useInteractionsContext } from '../../contexts/interaction-context';
import { type ExtendedWindow } from '../../sync/types';

const getAnimationOptions = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.ElementorInteractionsConfig?.animationOptions;
};

const ANIMATION_OPTIONS = getAnimationOptions() || [ { value: '', label: 'Select animation...' } ];

export const InteractionsInput = () => {
	const { interactions, setInteractions } = useInteractionsContext();

    React.useEffect(() => {
		console.log('🎛️ InteractionsInput - Current State:', {
			interactions,
			parsedInteractions: (() => {
				try {
					return JSON.parse(interactions || '[]');
				} catch {
					return 'Invalid JSON';
				}
			})(),
			timestamp: new Date().toISOString()
		});
	}, [interactions]);

	const currentAnimationIds = React.useMemo( () => {
		try {
			const parsed = JSON.parse( interactions || '[]' );
			if ( Array.isArray( parsed ) ) {
				return parsed.map( ( item ) =>
					typeof item === 'string' ? item : item?.animation?.animation_id || ''
				);
			}
			return [];
		} catch {
			return [];
		}
	}, [ interactions ] );

	const handleAddInteraction = () => {
		const newAnimationIds = [ ...currentAnimationIds, '' ];
		const newInteractions = newAnimationIds.map( ( animationId ) => ( {
			animation: {
				animation_type: 'full-preset',
				animation_id: animationId,
			},
		} ) );
		setInteractions( JSON.stringify( newInteractions ) );
	};

	const handleRemoveInteraction = ( index: number ) => {
		const newAnimationIds = currentAnimationIds.filter( ( _, i ) => i !== index );
		// Convert to full object structure for database
		const newInteractions = newAnimationIds.map( ( animationId ) => ( {
			animation: {
				animation_type: 'full-preset',
				animation_id: animationId,
			},
		} ) );
		setInteractions( JSON.stringify( newInteractions ) );
	};

	const handleChangeInteraction = ( index: number, value: string ) => {
		const newAnimationIds = [ ...currentAnimationIds ];
		newAnimationIds[ index ] = value;
		const newInteractions = newAnimationIds.map( ( animationId ) => ( {
			animation: {
				animation_type: 'full-preset',
				animation_id: animationId,
			},
		} ) );
		setInteractions( JSON.stringify( newInteractions ) );
	};

	const handleDuplicateInteraction = ( index: number ) => {
		const animationId = currentAnimationIds[ index ];
		const newAnimationIds = [ ...currentAnimationIds ];
		newAnimationIds.splice( index + 1, 0, animationId );
		const newInteractions = newAnimationIds.map( ( currentAnimationId ) => ( {
			animation: {
				animation_type: 'full-preset',
				animation_id: currentAnimationId,
			},
		} ) );
		setInteractions( JSON.stringify( newInteractions ) );
	};

	return (
		<Stack spacing={ 1 }>
			<Stack direction="row" alignItems="center" gap={ 1 } sx={ { marginInlineEnd: -0.75, py: 0.25 } }>
				<Box display="flex" alignItems="center" gap={ 1 } sx={ { flexGrow: 1 } }>
					<Typography component="label" variant="caption" color="text.secondary" sx={ { lineHeight: 1 } }>
						{ __( 'Interactions', 'elementor' ) }
					</Typography>
				</Box>
				<Tooltip title={ __( 'Add interaction', 'elementor' ) } placement="top">
					<IconButton
						size="tiny"
						onClick={ handleAddInteraction }
						aria-label={ __( 'Add interaction', 'elementor' ) }
					>
						<CirclePlusIcon fontSize="tiny" />
					</IconButton>
				</Tooltip>
			</Stack>
			<Stack spacing={ 0.5 }>
				{ currentAnimationIds.map( ( animationId, index ) => (
					<InteractionItem
						key={ index }
						index={ index }
						animationId={ animationId }
						onChange={ handleChangeInteraction }
						onRemove={ handleRemoveInteraction }
						onDuplicate={ handleDuplicateInteraction }
						canRemove={ currentAnimationIds.length > 1 }
					/>
				) ) }
			</Stack>
		</Stack>
	);
};

const InteractionItem = ( {
	index,
	animationId,
	onChange,
	onRemove,
	onDuplicate,
	canRemove,
}: {
	index: number;
	animationId: string;
	onChange: ( index: number, value: string ) => void;
	onRemove: ( index: number ) => void;
	onDuplicate: ( index: number ) => void;
	canRemove: boolean;
} ) => {
	const popoverState = usePopupState( { variant: 'popover' } );

	const selectedOption = ANIMATION_OPTIONS.find( ( option ) => option.value === animationId );
	const displayLabel = selectedOption?.label || 'Select animation...';
	const isShowingPlaceholder = ! animationId;

	const handleSelect = ( value: string ) => {
		onChange( index, value );
		popoverState.close();
	};

	return (
		<>
			<UnstableTag
				variant="outlined"
				label={ displayLabel }
				endIcon={ <ChevronDownIcon fontSize="tiny" /> }
				{ ...bindTrigger( popoverState ) }
				fullWidth
				showActionsOnHover
				sx={ {
					minHeight: ( theme ) => theme.spacing( 3.5 ),
					...( isShowingPlaceholder && {
						'& .MuiTag-label': {
							color: ( theme ) => theme.palette.text.tertiary,
						},
					} ),
				} }
				actions={
					<>
						<Tooltip title={ __( 'Duplicate', 'elementor' ) } placement="top">
							<IconButton
								size="tiny"
								onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
									e.stopPropagation();
									onDuplicate( index );
								} }
								aria-label={ __( 'Duplicate', 'elementor' ) }
							>
								<CopyIcon fontSize="tiny" />
							</IconButton>
						</Tooltip>
						{ canRemove && (
							<Tooltip title={ __( 'Remove', 'elementor' ) } placement="top">
								<IconButton
									size="tiny"
									onClick={ ( e: React.MouseEvent< HTMLButtonElement > ) => {
										e.stopPropagation();
										onRemove( index );
									} }
									aria-label={ __( 'Remove', 'elementor' ) }
									color="error"
								>
									<CircleXIcon fontSize="tiny" />
								</IconButton>
							</Tooltip>
						) }
					</>
				}
			/>

			<Popover
				disablePortal
				slotProps={ {
					paper: {
						sx: {
							mt: 0.5,
							minWidth: 200,
							maxHeight: 300,
							overflow: 'auto',
						},
					},
				} }
				anchorOrigin={ { vertical: 'bottom', horizontal: 'left' } }
				{ ...bindPopover( popoverState ) }
			>
				<Box sx={ { p: 1 } }>
					{ ANIMATION_OPTIONS.map( ( option ) => (
						<MenuItem
							key={ option.value }
							value={ option.value }
							onClick={ () => handleSelect( option.value ) }
							selected={ option.value === animationId }
							sx={ {
								minHeight: 32,
								fontSize: '0.75rem',
								'&.Mui-selected': {
									backgroundColor: 'action.selected',
								},
							} }
						>
							<ListItemText
								primary={ option.label }
								primaryTypographyProps={ {
									variant: 'caption',
									color: option.value === animationId ? 'primary' : 'text.primary',
								} }
							/>
						</MenuItem>
					) ) }
				</Box>
			</Popover>
		</>
	);
};
