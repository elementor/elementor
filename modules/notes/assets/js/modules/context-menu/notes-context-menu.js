export class NotesContextMenu extends elementorModules.editor.utils.Module {
	onInit() {
		this.contextMenuNotesGroup();
	}

	contextMenuNotesGroup() {
		const elTypes = [ 'widget', 'section', 'column', 'container' ];

		elTypes.forEach( ( type ) => {
			elementor.hooks.addFilter( `elements/${ type }/contextMenuGroups`, this.contextMenuAddGroup );
		} );
	}

	/**
	 * Append the 'Notes' context menu group
	 *
	 * @since 3.8.0
	 *
	 * @param {Array} groups
	 * @return {Array} The updated groups.
	 */
	contextMenuAddGroup( groups ) {
		const deleteGroup = _.findWhere( groups, { name: 'delete' } );
		let deleteGroupIndex = groups.indexOf( deleteGroup );

		if ( -1 === deleteGroupIndex ) {
			deleteGroupIndex = groups.length;
		}

		groups.splice( deleteGroupIndex, 0, {
			name: 'notes',
			actions: [
				{
					name: 'open_notes',
					title: __( 'Notes', 'elementor' ),
					shortcut: '<i class="eicon-pro-icon"></i>',
					promotionURL: 'https://go.elementor.com/go-pro-notes-context-menu/',
					isEnabled: () => false,
					callback: () => {},
				},
			],
		} );

		return groups;
	}
}

export default NotesContextMenu;
