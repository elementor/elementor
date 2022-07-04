class Module extends elementorModules.editor.utils.Module {
	onInit() {
		this.contextMenuNotesGroup();
	}

	contextMenuNotesGroup() {
		const elTypes = [ 'widget', 'section', 'column', 'container' ];

		elTypes.forEach( ( type ) => {
			elementor.hooks.addFilter( `elements/${ type }/contextMenuGroups`, this.contextMenuAddGroup );
		} );
	}

	contextMenuAddGroup( groups ) {
		const deleteGroup = _.findWhere( groups, { name: 'delete' } );
		let afterGroupIndex = groups.indexOf( deleteGroup );

		if ( -1 === afterGroupIndex ) {
			afterGroupIndex = groups.length;
		}

		groups.splice( afterGroupIndex, 0, {
			name: 'notes',
			actions: [
				{
					name: 'notes',
					title: __( 'Notes', 'elementor' ),
					shortcut: '<i class="eicon-pro-icon" />',
					isEnabled: () => false,
					callback: () => {},
				},
			],
		} );

		return groups;
	}
}

new Module();
