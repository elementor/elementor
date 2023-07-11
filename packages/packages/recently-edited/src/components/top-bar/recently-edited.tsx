import {
	bindMenu,
	usePopupState,
	bindTrigger,
	Stack,
	Menu,
	Button,
} from '@elementor/ui';
import { ChevronDownIcon } from '@elementor/icons';
import { useActiveDocument, useHostDocument } from '@elementor/documents';
import SettingsButton from './settings-button';
import Indicator from './indicator';
import PostsList from './posts-list';
import useRecentPosts from '../../hooks/use-recent-posts';

export default function RecentlyEdited() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();
	const document = activeDocument && activeDocument.type.value !== 'kit'
		? activeDocument
		: hostDocument;

	const { recentPosts } = useRecentPosts( document?.id );

	const popupState = usePopupState( {
		variant: 'popover',
		popupId: 'elementor-v2-top-bar-recently-edited',
	} );

	if ( ! document ) {
		return null;
	}

	return (
		<Stack direction="row" spacing={ 1 } alignItems="center" sx={ { paddingInlineStart: 1, cursor: 'default' } }>
			<Button
				color="inherit"
				size="small"
				endIcon={ <ChevronDownIcon fontSize="small" /> }
				{ ...bindTrigger( popupState ) }
			>
				<Indicator
					title={ document.title }
					status={ document.status }
				/>
			</Button>

			<Menu
				PaperProps={ { sx: { mt: 4, minWidth: 314 } } }
				{ ...bindMenu( popupState ) }
			>
				<PostsList recentPosts={ recentPosts } />
			</Menu>

			<SettingsButton type={ document.type } />
		</Stack>
	);
}
