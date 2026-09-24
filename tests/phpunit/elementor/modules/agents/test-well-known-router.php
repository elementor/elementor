<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Auth_Md;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Well_Known_Router;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Well_Known_Router extends Elementor_Test_Base {

	private Well_Known_Router $router;

	private $original_experiment_default_state;

	private string $original_request_uri;

	public function setUp(): void {
		parent::setUp();

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$this->router = new Well_Known_Router();
		$this->router->register_endpoint( new Auth_Md() );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		$_SERVER['REQUEST_URI'] = $this->original_request_uri;

		parent::tearDown();
	}

	public function test_maybe_handle__falls_through_for_non_well_known_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/about';

		// Act
		ob_start();
		$this->router->maybe_handle();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_maybe_handle__falls_through_for_unknown_well_known_slug() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/.well-known/unknown-endpoint';

		// Act
		ob_start();
		$this->router->maybe_handle();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_maybe_handle__falls_through_when_endpoint_disabled() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);
		$_SERVER['REQUEST_URI'] = '/.well-known/auth.md';

		// Act
		ob_start();
		$this->router->maybe_handle();
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_get_normalized_path__matches_subdirectory_install() {
		// Arrange
		add_filter( 'home_url', static function () {
			return 'http://example.com/blog';
		} );
		$_SERVER['REQUEST_URI'] = '/blog/.well-known/auth.md?foo=bar';

		$method = new \ReflectionMethod( Well_Known_Router::class, 'get_normalized_path' );
		$method->setAccessible( true );

		// Act
		$path = $method->invoke( $this->router );

		// Cleanup
		remove_all_filters( 'home_url' );

		// Assert
		$this->assertSame( '/.well-known/auth.md', $path );
	}

	public function test_get_active_endpoints__includes_auth_md_when_enabled() {
		// Act
		$active = $this->router->get_active_endpoints();

		// Assert
		$this->assertArrayHasKey( 'auth.md', $active );
		$this->assertInstanceOf( Auth_Md::class, $active['auth.md'] );
	}

	public function test_auth_md__generates_authentication_markdown() {
		// Arrange
		$auth_md = new Auth_Md();
		$method = new \ReflectionMethod( Auth_Md::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $auth_md );

		// Assert
		$this->assertStringContainsString( '# Authentication', $content );
	}

	public function test_auth_md__lists_oauth_before_application_passwords_when_applicable() {
		// Arrange
		add_filter( 'elementor/agents/oauth_authorization_server/is_applicable', '__return_true' );
		$auth_md = new Auth_Md();
		$method  = new \ReflectionMethod( Auth_Md::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $auth_md );

		// Cleanup
		remove_filter( 'elementor/agents/oauth_authorization_server/is_applicable', '__return_true' );

		// Assert
		$this->assertStringContainsString( '### OAuth 2.1 + PKCE (available)', $content );
		$this->assertStringContainsString( '### Application Passwords (active)', $content );
		$this->assertLessThan(
			strpos( $content, '### Application Passwords (active)' ),
			strpos( $content, '### OAuth 2.1 + PKCE (available)' )
		);
	}

	public function test_auth_md__omits_mcp_sections_when_not_advertised() {
		// Arrange
		$auth_md = new Auth_Md();
		$method  = new \ReflectionMethod( Auth_Md::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $auth_md );

		// Assert
		$this->assertStringContainsString( '.well-known/api-catalog', $content );
		$this->assertStringContainsString( '### Application Passwords (active)', $content );
		$this->assertStringNotContainsString( 'oauth-protected-resource', $content );
		$this->assertStringNotContainsString( 'server-card.json', $content );
		$this->assertStringNotContainsString( '## MCP Endpoint', $content );
		$this->assertStringNotContainsString( 'elementor/agents-mcp', $content );
		$this->assertStringNotContainsString( 'with every MCP request', $content );
		$this->assertStringNotContainsString( '## Scopes', $content );
		$this->assertStringNotContainsString( '## Audit Log', $content );
	}

	public function test_auth_md__includes_mcp_sections_when_advertised() {
		// Arrange
		add_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );
		$auth_md = new Auth_Md();
		$method  = new \ReflectionMethod( Auth_Md::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $auth_md );

		// Cleanup
		remove_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );

		// Assert
		$this->assertStringContainsString( 'oauth-protected-resource', $content );
		$this->assertStringContainsString( 'server-card.json', $content );
		$this->assertStringContainsString( '## MCP Endpoint', $content );
		$this->assertStringContainsString( 'elementor/agents-mcp', $content );
		$this->assertStringContainsString( 'with every MCP request', $content );
		$this->assertStringContainsString( '## Scopes', $content );
		$this->assertStringContainsString( '## Audit Log', $content );
		$this->assertLessThan(
			strpos( $content, '## Authentication Methods' ),
			strpos( $content, '## MCP Endpoint' )
		);
	}

	public function test_auth_md__omits_oauth_section_when_not_applicable() {
		// Arrange
		$auth_md = new Auth_Md();
		$method  = new \ReflectionMethod( Auth_Md::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $auth_md );

		// Assert
		$this->assertStringContainsString( '### Application Passwords (active)', $content );
		$this->assertStringNotContainsString( '### OAuth 2.1 + PKCE (available)', $content );
	}

	public function test_ard_manifest__omits_protected_resource_when_mcp_card_off() {
		// Arrange
		$manifest = new Ard_Manifest();
		$method   = new \ReflectionMethod( Ard_Manifest::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $manifest );

		// Assert
		$this->assertArrayHasKey( 'documentation', $content['capabilities']['auth'] );
		$this->assertArrayNotHasKey( 'protected_resource', $content['capabilities']['auth'] );
	}

	public function test_ard_manifest__includes_protected_resource_when_mcp_card_on() {
		// Arrange
		add_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );
		$manifest = new Ard_Manifest();
		$method   = new \ReflectionMethod( Ard_Manifest::class, 'generate_content' );
		$method->setAccessible( true );

		// Act
		$content = $method->invoke( $manifest );

		// Cleanup
		remove_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );

		// Assert
		$this->assertSame(
			trailingslashit( home_url() ) . '.well-known/oauth-protected-resource',
			$content['capabilities']['auth']['protected_resource']
		);
	}

	public function test_flush_all_caches__clears_registered_endpoint_transients() {
		// Arrange
		$auth_md = new Auth_Md();
		$this->router->register_endpoint( $auth_md );
		set_transient( $auth_md->get_transient_key(), [ 'body' => 'cached' ], MINUTE_IN_SECONDS );

		// Act
		$this->router->flush_all_caches();

		// Assert
		$this->assertFalse( get_transient( $auth_md->get_transient_key() ) );
	}
}
