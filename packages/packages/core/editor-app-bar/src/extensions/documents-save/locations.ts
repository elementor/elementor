import { createMenu } from '@elementor/menus';

import Action from '../../components/actions/action';
import Link from '../../components/actions/link';
import ToggleAction from '../../components/actions/toggle-action';

export const documentOptionsMenu = createMenu( {
	groups: [ 'save' ],
	components: {
		Action,
		ToggleAction,
		Link,
	},
} );
