import { useEffect, useRef, useState } from 'react';
import { ExternalLinkIcon, ZoomIcon } from '@elementor/icons';
import Box from '@elementor/ui/Box';
import CircularProgress from '@elementor/ui/CircularProgress';
import Dialog from '@elementor/ui/Dialog';
import DialogContent from '@elementor/ui/DialogContent';
import DialogHeader from '@elementor/ui/DialogHeader';
import DialogTitle from '@elementor/ui/DialogTitle';
import InputAdornment from '@elementor/ui/InputAdornment';
import Link from '@elementor/ui/Link';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import TextField from '@elementor/ui/TextField';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { useContentItems } from '../hooks/use-content-items';
import { DIALOG_Z_INDEX } from './content-preview-dialog';
import { wpAdminInputResetSx, wpAdminSwitchSx } from './wp-admin-sx';

const LIST_MAX_HEIGHT = 400;
const LOAD_MORE_THRESHOLD_PX = 48;
const PROGRESS_SIZE = 20;
const FIELD_RADIUS = '8px';

const isNearBottom = ( element ) => element.scrollHeight - element.scrollTop - element.clientHeight <= LOAD_MORE_THRESHOLD_PX;

const isNotScrollable = ( element ) => element.scrollHeight <= element.clientHeight;

const ItemRow = ( { item, isIncluded, isDisabled, onToggle } ) => (
	<Stack direction="row" alignItems="center" spacing={ 2 } py={ 1 }>
		<Link
			href={ item.url }
			target="_blank"
			rel="noopener noreferrer"
			variant="body2"
			color="text.primary"
			underline="hover"
			noWrap
			flexGrow={ 1 }
			minWidth={ 0 }
		>
			{ item.title || __( '(no title)', 'elementor' ) }
			<ExternalLinkIcon fontSize="tiny" sx={ { ml: 0.5, verticalAlign: 'middle' } } />
		</Link>
		<Switch
			size="small"
			checked={ isIncluded }
			disabled={ isDisabled }
			onChange={ onToggle }
			inputProps={ { 'aria-label': item.title } }
			sx={ wpAdminSwitchSx }
		/>
	</Stack>
);

ItemRow.propTypes = {
	item: PropTypes.shape( {
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
	} ).isRequired,
	isIncluded: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
};

export const PostExclusionDialog = ( { module, postType, excludedPostIds, isDisabled = false, onToggle, onClose } ) => {
	const listRef = useRef( null );
	const [ term, setTerm ] = useState( '' );
	const { items, isLoading, loadMore } = useContentItems( { module, postType: postType.name, term } );
	const excludedSet = new Set( excludedPostIds );

	useEffect( () => {
		if ( listRef.current && isNotScrollable( listRef.current ) ) {
			loadMore();
		}
	}, [ items, loadMore ] );

	const handleScroll = ( event ) => {
		if ( isNearBottom( event.currentTarget ) ) {
			loadMore();
		}
	};

	const hasNoResults = ! isLoading && ! items.length;

	return (
		<Dialog open maxWidth="sm" fullWidth onClose={ onClose } sx={ { zIndex: DIALOG_Z_INDEX } }>
			<DialogHeader onClose={ onClose } logo={ false }>
				<DialogTitle>{ postType.label }</DialogTitle>
			</DialogHeader>
			<DialogContent dividers>
				<Stack spacing={ 2 }>
					<Typography variant="body2" color="text.secondary">
						{ sprintf(
							/* Translators: 1: Number of published items, 2: Number of excluded items. */
							__( '%1$d published · %2$d excluded', 'elementor' ),
							postType.count,
							postType.excludedCount ?? 0,
						) }
					</Typography>
					<TextField
						fullWidth
						size="tiny"
						value={ term }
						onChange={ ( event ) => setTerm( event.target.value ) }
						placeholder={ __( 'Search', 'elementor' ) }
						inputProps={ { 'aria-label': sprintf(
							/* Translators: %s: Post type label, e.g. Pages. */
							__( 'Search %s', 'elementor' ),
							postType.label,
						) } }
						InputProps={ {
							startAdornment: (
								<InputAdornment position="start">
									<ZoomIcon fontSize="tiny" />
								</InputAdornment>
							),
							sx: { borderRadius: FIELD_RADIUS },
						} }
						sx={ wpAdminInputResetSx }
					/>
					<Box ref={ listRef } maxHeight={ LIST_MAX_HEIGHT } overflow="auto" onScroll={ handleScroll } data-testid="post-exclusion-list">
						<Stack>
							{ items.map( ( item ) => (
								<ItemRow
									key={ item.id }
									item={ item }
									isIncluded={ ! excludedSet.has( item.id ) }
									isDisabled={ isDisabled }
									onToggle={ () => onToggle( postType.name, item.id ) }
								/>
							) ) }
						</Stack>
						{ isLoading && (
							<Stack alignItems="center" py={ 2 }>
								<CircularProgress size={ PROGRESS_SIZE } aria-label={ __( 'Loading', 'elementor' ) } />
							</Stack>
						) }
						{ hasNoResults && (
							<Typography variant="body2" color="text.secondary" align="center" py={ 4 }>
								{ __( 'Nothing matched your search.', 'elementor' ) }
							</Typography>
						) }
					</Box>
				</Stack>
			</DialogContent>
		</Dialog>
	);
};

PostExclusionDialog.propTypes = {
	module: PropTypes.string.isRequired,
	postType: PropTypes.shape( {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		count: PropTypes.number.isRequired,
		excludedCount: PropTypes.number,
	} ).isRequired,
	excludedPostIds: PropTypes.arrayOf( PropTypes.number ).isRequired,
	isDisabled: PropTypes.bool,
	onToggle: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
