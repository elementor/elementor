<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
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
