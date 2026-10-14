class MenuActiveStateResolver {
	constructor( activeMenuSlug, activeChildSlug ) {
		this.activeMenuSlug = activeMenuSlug;
		this.activeChildSlug = activeChildSlug;
	}

	isMenuActive( item ) {
		return item.slug === this.activeMenuSlug;
	}

	isChildActive( childItem ) {
		return childItem.slug === this.activeChildSlug;
	}
}

export default MenuActiveStateResolver;

