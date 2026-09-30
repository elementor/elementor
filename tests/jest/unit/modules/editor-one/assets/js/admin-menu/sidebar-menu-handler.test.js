import { SidebarMenuHandler } from 'elementor/modules/editor-one/assets/js/admin-menu/classes/sidebar-menu-handler';

const buildAdminMenu = () => {
	document.body.innerHTML = `
		<ul id="adminmenu">
			<li id="toplevel_page_elementor-home" class="wp-has-submenu">
				<a class="menu-top" href="admin.php?page=elementor">Elementor</a>
				<ul class="wp-submenu">
					<li><a href="admin.php?page=elementor">Editor</a></li>
					<li><a href="admin.php?page=elementor-mcp">Elementor MCP</a></li>
					<li><a href="admin.php?page=elementor-agents-ready">Agents Ready</a></li>
				</ul>
			</li>
		</ul>
	`;
};

const getCurrentSubmenuLabel = () => {
	const currentLink = document.querySelector( '#toplevel_page_elementor-home .wp-submenu li.current a' );

	return currentLink ? currentLink.textContent : null;
};

describe( 'SidebarMenuHandler', () => {
	const originalLocation = window.location;

	afterEach( () => {
		document.body.innerHTML = '';
		delete window.location;
		window.location = originalLocation;
	} );

	it( 'highlights Agents Ready in the WordPress submenu when that page is selected', () => {
		// Arrange.
		delete window.location;
		window.location = new URL( 'https://example.com/wp-admin/admin.php?page=elementor-agents-ready' );
		buildAdminMenu();

		// Act.
		new SidebarMenuHandler();

		// Assert.
		expect( getCurrentSubmenuLabel() ).toBe( 'Agents Ready' );
	} );

	it( 'highlights Elementor MCP in the WordPress submenu when that page is selected', () => {
		// Arrange.
		delete window.location;
		window.location = new URL( 'https://example.com/wp-admin/admin.php?page=elementor-mcp' );
		buildAdminMenu();

		// Act.
		new SidebarMenuHandler();

		// Assert.
		expect( getCurrentSubmenuLabel() ).toBe( 'Elementor MCP' );
	} );
} );
