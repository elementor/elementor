import { useState } from 'react';
import { ArchiveTemplateIcon, ChevronDownIcon, ChevronUpIcon, FileIcon, PinIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Collapse from '@elementor/ui/Collapse';
import Link from '@elementor/ui/Link';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import Tooltip from '@elementor/ui/Tooltip';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LLMS_VISIBLE_POST_TYPES_LIMIT } from '../constants';
import { PostExclusionDialog } from './post-exclusion-dialog';
import { wpAdminSwitchSx } from './wp-admin-sx';

const iconsByPostType = {
	page: FileIcon,
	post: PinIcon,
};

const PostTypeLabel = ( { label, onOpenItems } ) => {
	if ( ! onOpenItems ) {
		return <Typography variant="body2">{ label }</Typography>;
	}

	return (
		<Link
			component="button"
			type="button"
			variant="body2"
			color="text.primary"
			underline="hover"
			onClick={ onOpenItems }
			aria-label={ sprintf(
				/* Translators: %s: Post type label, e.g. Pages. */
				__( 'Choose which %s to include', 'elementor' ),
				label,
			) }
		>
			{ label }
		</Link>
	);
};

PostTypeLabel.propTypes = {
	label: PropTypes.string.isRequired,
	onOpenItems: PropTypes.func,
};

const PublishedStatus = ( { count, excludedCount } ) => {
	if ( ! excludedCount ) {
		return (
			<Typography variant="body2" color="text.secondary">
				{ /* Translators: %d: Number of published items. */ }
				{ sprintf( __( '%d published', 'elementor' ), count ) }
			</Typography>
		);
	}

	const visibleCount = count - excludedCount;

	return (
		<Tooltip
			title={ sprintf(
				/* Translators: 1: Number of items visible to agents, 2: Number of excluded items. */
				__( '%1$d visible to agents · %2$d excluded', 'elementor' ),
				visibleCount,
				excludedCount,
			) }
		>
			<Typography variant="body2" color="text.secondary">
				{ /* Translators: 1: Number of items visible to agents, 2: Number of published items. */ }
				{ sprintf( __( '%1$d/%2$d published', 'elementor' ), visibleCount, count ) }
			</Typography>
		</Tooltip>
	);
};

PublishedStatus.propTypes = {
	count: PropTypes.number.isRequired,
	excludedCount: PropTypes.number.isRequired,
};

const PostTypeRow = ( { name, label, count, excludedCount, isIncluded, isDisabled, onToggle, onOpenItems } ) => {
	const Icon = iconsByPostType[ name ] ?? ArchiveTemplateIcon;
	const canOpenItems = Boolean( onOpenItems ) && isIncluded && ! isDisabled;

	return (
		<Stack direction="row" alignItems="center" py={ 1 }>
			<Stack direction="row" alignItems="center" spacing={ 1 } width={ 120 }>
				<Icon fontSize="small" color="action" />
				<PostTypeLabel label={ label } onOpenItems={ canOpenItems ? onOpenItems : undefined } />
			</Stack>
			<Stack direction="row" alignItems="center" width={ 120 } flexGrow={ 1 }>
				<PublishedStatus count={ count } excludedCount={ isIncluded ? excludedCount : 0 } />
			</Stack>
			<Switch
				size="small"
				checked={ isIncluded }
				disabled={ isDisabled }
				onChange={ onToggle }
				inputProps={ { 'aria-label': label } }
				sx={ wpAdminSwitchSx }
			/>
		</Stack>
	);
};

PostTypeRow.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	excludedCount: PropTypes.number.isRequired,
	isIncluded: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
	onOpenItems: PropTypes.func,
};

export const PostTypeList = ( { postTypes, isDisabled, onToggle, exclusions } ) => {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ openPostTypeName, setOpenPostTypeName ] = useState( null );
	const openPostType = postTypes.find( ( postType ) => postType.name === openPostTypeName );

	const closeItemsDialog = () => {
		setOpenPostTypeName( null );
		exclusions?.onClose();
	};

	const visiblePostTypes = postTypes.slice( 0, LLMS_VISIBLE_POST_TYPES_LIMIT );
	const hiddenPostTypes = postTypes.slice( LLMS_VISIBLE_POST_TYPES_LIMIT );

	const renderRows = ( items ) => (
		<Stack>
			{ items.map( ( postType ) => (
				<PostTypeRow
					key={ postType.name }
					name={ postType.name }
					label={ postType.label }
					count={ postType.count }
					excludedCount={ postType.excludedCount ?? 0 }
					isIncluded={ postType.included }
					isDisabled={ isDisabled }
					onToggle={ () => onToggle( postType.name ) }
					onOpenItems={ exclusions ? () => setOpenPostTypeName( postType.name ) : undefined }
				/>
			) ) }
		</Stack>
	);

	return (
		<Stack alignItems="flex-start">
			<Stack width="100%">
				{ renderRows( visiblePostTypes ) }
				{ hiddenPostTypes.length > 0 && (
					<Collapse in={ isExpanded }>
						{ renderRows( hiddenPostTypes ) }
					</Collapse>
				) }
			</Stack>
			{ hiddenPostTypes.length > 0 && (
				<Button
					variant="text"
					color="info"
					size="small"
					endIcon={ isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon /> }
					onClick={ () => setIsExpanded( ( previous ) => ! previous ) }
				>
					{ isExpanded ? __( 'Show less', 'elementor' ) : __( 'Show more', 'elementor' ) }
				</Button>
			) }
			{ openPostType && exclusions && (
				<PostExclusionDialog
					module={ exclusions.module }
					postType={ openPostType }
					excludedPostIds={ exclusions.excludedPostIds }
					onToggle={ exclusions.onToggle }
					onClose={ closeItemsDialog }
				/>
			) }
		</Stack>
	);
};

PostTypeList.propTypes = {
	postTypes: PropTypes.arrayOf( PropTypes.shape( {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		count: PropTypes.number.isRequired,
		included: PropTypes.bool.isRequired,
		excludedCount: PropTypes.number,
	} ) ).isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
	exclusions: PropTypes.shape( {
		module: PropTypes.string.isRequired,
		excludedPostIds: PropTypes.arrayOf( PropTypes.number ).isRequired,
		onToggle: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
	} ),
};
