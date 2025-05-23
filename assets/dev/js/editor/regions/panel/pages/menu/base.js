import PanelMenuGroupView from 'elementor-panel/pages/menu/views/group';

export default class MenuPageView extends Marionette.CompositeView {
	id() {
		return 'elementor-panel-page-menu';
	}

	getTemplate() {
		return '#tmpl-elementor-panel-menu';
	}

	getChildView() {
		return PanelMenuGroupView;
	}

	childViewContainer() {
		return '#elementor-panel-page-menu-content';
	}

	// Remove empty groups that exist for BC.
	filter( child ) {
		return child.get( 'items' ).length;
	}
}

MenuPageView.addItem = ( groups, itemData, groupName, before ) => {
	const group = groups.findWhere( { name: groupName } );

	if ( ! group ) {
		return;
	}

	const items = group.get( 'items' ),
		exists = _.findWhere( items, { name: itemData.name } ); // Remove if exist.

	let	beforeItem;

	if ( exists ) {
		items.splice( items.indexOf( exists ), 1 );
	}

	if ( before ) {
		beforeItem = _.findWhere( items, { name: before } );
	}

	if ( beforeItem ) {
		items.splice( items.indexOf( beforeItem ), 0, itemData );
	} else {
		items.push( itemData );
	}
};
