import { useState } from 'react';
import { ArchiveTemplateIcon, ChevronDownIcon, ChevronUpIcon, FileIcon, PinIcon } from '@elementor/icons';
import Button from '@elementor/ui/Button';
import Collapse from '@elementor/ui/Collapse';
import Divider from '@elementor/ui/Divider';
import Stack from '@elementor/ui/Stack';
import Switch from '@elementor/ui/Switch';
import Typography from '@elementor/ui/Typography';
import { __, sprintf } from '@wordpress/i18n';
import PropTypes from 'prop-types';

import { LLMS_VISIBLE_POST_TYPES_LIMIT } from '../../constants';

const iconsByPostType = {
	page: FileIcon,
	post: PinIcon,
};

const PostTypeRow = ( { name, label, count, isIncluded, isDisabled, onToggle } ) => {
	const Icon = iconsByPostType[ name ] ?? ArchiveTemplateIcon;

	return (
		<Stack direction="row" alignItems="center" py={ 1 }>
			<Stack direction="row" alignItems="center" spacing={ 1 } sx={ { width: 180 } }>
				<Icon fontSize="small" color="action" />
				<Typography variant="body2">{ label }</Typography>
			</Stack>
			<Typography variant="body2" color="text.secondary" sx={ { width: 120, flexGrow: 1 } }>
				{ /* Translators: %d: Number of published items. */ }
				{ sprintf( __( '%d published', 'elementor' ), count ) }
			</Typography>
			<Switch
				size="small"
				checked={ isIncluded }
				disabled={ isDisabled }
				onChange={ onToggle }
				inputProps={ { 'aria-label': label } }
				sx={ {
					'& .MuiSwitch-input': {
						position: 'absolute',
						// WordPress admin sets opacity on disabled checkboxes, which draws the native control through the switch.
						opacity: '0 !important',
					},
				} }
			/>
		</Stack>
	);
};

PostTypeRow.propTypes = {
	name: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	count: PropTypes.number.isRequired,
	isIncluded: PropTypes.bool.isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
};

export const PostTypeList = ( { postTypes, isDisabled, onToggle } ) => {
	const [ isExpanded, setIsExpanded ] = useState( false );

	const visiblePostTypes = postTypes.slice( 0, LLMS_VISIBLE_POST_TYPES_LIMIT );
	const hiddenPostTypes = postTypes.slice( LLMS_VISIBLE_POST_TYPES_LIMIT );

	const renderRows = ( items ) => (
		<Stack divider={ <Divider /> }>
			{ items.map( ( postType ) => (
				<PostTypeRow
					key={ postType.name }
					name={ postType.name }
					label={ postType.label }
					count={ postType.count }
					isIncluded={ postType.included }
					isDisabled={ isDisabled }
					onToggle={ () => onToggle( postType.name ) }
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
						<Divider />
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
		</Stack>
	);
};

PostTypeList.propTypes = {
	postTypes: PropTypes.arrayOf( PropTypes.shape( {
		name: PropTypes.string.isRequired,
		label: PropTypes.string.isRequired,
		count: PropTypes.number.isRequired,
		included: PropTypes.bool.isRequired,
	} ) ).isRequired,
	isDisabled: PropTypes.bool.isRequired,
	onToggle: PropTypes.func.isRequired,
};
