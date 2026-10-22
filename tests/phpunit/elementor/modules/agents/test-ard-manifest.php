<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Ard_Manifest extends Elementor_Test_Base {

	private Ard_Manifest $ard_manifest;

	private Agent_Ready_Settings $settings;

	private Module $module;

	private $original_experiment_default_state;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		$this->module = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->ard_manifest = new Ard_Manifest( $this->module );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		Module::reset_physical_file_cache();

		parent::tearDown();
	}

	public function test_generate_content__includes_llms_txt_when_enabled() {
		$home = trailingslashit( home_url() );

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'llms_txt', $content['capabilities'] );
		$this->assertArrayHasKey( 'url', $content['capabilities']['llms_txt'] );
		$this->assertSame( $home . 'llms.txt', $content['capabilities']['llms_txt']['url'] );
		$this->assertArrayHasKey( 'full_url', $content['capabilities']['llms_txt'] );
		$this->assertSame( $home . 'llms-full.txt', $content['capabilities']['llms_txt']['full_url'] );
	}

	public function test_generate_content__includes_full_url_but_not_url_when_decision_is_keep() {
		$home = trailingslashit( home_url() );
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );
		Module::reset_physical_file_cache();

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'llms_txt', $content['capabilities'] );
		$this->assertArrayNotHasKey( 'url', $content['capabilities']['llms_txt'] );
		$this->assertArrayHasKey( 'full_url', $content['capabilities']['llms_txt'] );
		$this->assertSame( $home . 'llms-full.txt', $content['capabilities']['llms_txt']['full_url'] );
	}

	public function test_generate_content__includes_full_url_but_not_url_when_physical_file_exists() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$home = trailingslashit( home_url() );
		$file_path = get_home_path() . Module::LLMS_FILENAME;

		try {
			file_put_contents( $file_path, '# Physical file' );
			update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );
			Module::reset_physical_file_cache();

			$content = $this->invoke_generate_content();

			$this->assertArrayHasKey( 'capabilities', $content );
			$this->assertArrayHasKey( 'llms_txt', $content['capabilities'] );
			$this->assertArrayNotHasKey( 'url', $content['capabilities']['llms_txt'] );
			$this->assertArrayHasKey( 'full_url', $content['capabilities']['llms_txt'] );
			$this->assertSame( $home . 'llms-full.txt', $content['capabilities']['llms_txt']['full_url'] );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			Module::reset_physical_file_cache();
		}
	}

	public function test_generate_content__omits_llms_txt_when_llms_is_disabled() {
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );
		Module::reset_physical_file_cache();

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayNotHasKey( 'llms_txt', $content['capabilities'] );
	}

	public function test_generate_content__includes_llms_txt_when_decision_is_replace() {
		$home = trailingslashit( home_url() );
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'llms_txt', $content['capabilities'] );
		$this->assertSame( $home . 'llms.txt', $content['capabilities']['llms_txt']['url'] );
	}

	public function test_generate_content__includes_full_url_when_enabled() {
		$home = trailingslashit( home_url() );

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'llms_txt', $content['capabilities'] );
		$this->assertArrayHasKey( 'full_url', $content['capabilities']['llms_txt'] );
		$this->assertSame( $home . 'llms-full.txt', $content['capabilities']['llms_txt']['full_url'] );
	}

	public function test_generate_content__omits_full_url_when_llms_disabled() {
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayNotHasKey( 'llms_txt', $content['capabilities'] );
	}

	public function test_generate_content__always_includes_rest_api() {
		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'rest_api', $content['capabilities'] );
		$this->assertArrayHasKey( 'url', $content['capabilities']['rest_api'] );
		$this->assertArrayHasKey( 'catalog', $content['capabilities']['rest_api'] );
	}

	public function test_generate_content__always_includes_auth() {
		$content = $this->invoke_generate_content();

		$this->assertArrayHasKey( 'capabilities', $content );
		$this->assertArrayHasKey( 'auth', $content['capabilities'] );
		$this->assertArrayHasKey( 'documentation', $content['capabilities']['auth'] );
	}

	private function invoke_generate_content(): array {
		$method = new \ReflectionMethod( Ard_Manifest::class, 'generate_content' );
		$method->setAccessible( true );

		return $method->invoke( $this->ard_manifest );
	}
}
