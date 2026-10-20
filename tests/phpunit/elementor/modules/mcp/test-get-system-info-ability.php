<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Logger\Log_Reporter;
use Elementor\Core\Logger\Manager as Log_Manager;
use Elementor\Modules\Mcp\Abilities\Get_System_Info_Ability;
use Elementor\Modules\System_Info\Module as System_Info_Module;
use Elementor\Modules\System_Info\Reporters\Base;
use Elementor\Modules\System_Info\Reporters\Base_Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_System_Info_Ability extends Elementor_Test_Base {

	private const FAKE_PLUGINS_REPORT = 'test_mcp_plugins';

	private const LOG_MESSAGE = 'MCP system info test error';

	private Get_System_Info_Ability $ability;
	private array $original_reports;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Get_System_Info_Ability();
		$this->original_reports = $this->reports_property()->getValue();
		$this->act_as_admin();
		add_filter( 'pre_http_request', [ $this, 'fail_http_request' ] );
	}

	public function tearDown(): void {
		remove_filter( 'pre_http_request', [ $this, 'fail_http_request' ] );
		$this->reports_property()->setValue( null, $this->original_reports );

		parent::tearDown();
	}

	public function fail_http_request() {
		return new \WP_Error( 'http_request_failed', 'Offline in tests.' );
	}

	public function test_execute__returns_server_and_wordpress_reports_as_plain_text() {
		// Arrange
		$input = [ 'reports' => [ 'server', 'wordpress' ] ];

		// Act
		$result = $this->ability->execute( $input );

		// Assert
		$this->assertSame( [ 'server', 'wordpress' ], array_keys( $result['reports'] ) );
		$this->assertContains( 'version', array_column( $result['reports']['wordpress']['fields'], 'name' ) );

		foreach ( $result['reports'] as $report ) {
			foreach ( $report['fields'] as $field ) {
				$this->assertSame( wp_strip_all_tags( $field['value'] ), $field['value'] );
			}
		}
	}

	public function test_execute__limits_output_to_requested_reports() {
		// Arrange
		$input = [ 'reports' => [ 'wordpress', 'does_not_exist' ] ];

		// Act
		$result = $this->ability->execute( $input );

		// Assert
		$this->assertSame( [ 'wordpress' ], array_keys( $result['reports'] ) );
	}

	public function test_execute__accepts_comma_separated_report_names() {
		// Arrange
		$input = [ 'reports' => 'server, wordpress' ];

		// Act
		$result = $this->ability->execute( $input );

		// Assert
		$this->assertSame( [ 'server', 'wordpress' ], array_keys( $result['reports'] ) );
	}

	public function test_execute__returns_every_report_when_none_requested() {
		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'server', $result['reports'] );
		$this->assertArrayHasKey( 'wordpress', $result['reports'] );
	}

	public function test_execute__leaves_out_opt_in_reports_when_none_requested() {
		// Arrange
		$this->register_fake_usage_report();

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertArrayHasKey( 'experiments', $result['reports'] );
		$this->assertArrayNotHasKey( 'log', $result['reports'] );
		$this->assertArrayNotHasKey( 'usage', $result['reports'] );
	}

	public function test_execute__returns_log_as_plain_text_when_requested() {
		// Arrange
		Log_Manager::instance()->get_logger()->error( self::LOG_MESSAGE );

		// Act
		$result = $this->ability->execute( [ 'reports' => [ 'log' ] ] );

		// Assert
		$log = $result['reports']['log']['fields'][0]['value'];

		$this->assertStringContainsString( self::LOG_MESSAGE, $log );
		$this->assertSame( wp_strip_all_tags( $log ), $log );
	}

	public function test_execute__keeps_log_entries_after_reading_them() {
		// Arrange
		$logger = Log_Manager::instance()->get_logger();
		$logger->error( self::LOG_MESSAGE );
		$_GET[ Log_Reporter::CLEAR_LOG_ACTION ] = '1';

		// Act
		$this->ability->execute( [ 'reports' => [ 'log' ] ] );
		unset( $_GET[ Log_Reporter::CLEAR_LOG_ACTION ] );

		// Assert
		$this->assertNotEmpty( $logger->get_log() );
	}

	public function test_execute__returns_not_found_when_no_requested_report_exists() {
		// Arrange
		$input = [ 'reports' => [ 'does_not_exist' ] ];

		// Act
		$result = $this->ability->execute( $input );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'report_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'wordpress', $result->get_error_message() );
	}

	public function test_execute__reduces_plugin_entries_to_name_version_and_author() {
		// Arrange
		$this->register_fake_plugins_report();

		// Act
		$result = $this->ability->execute( [ 'reports' => [ self::FAKE_PLUGINS_REPORT ] ] );

		// Assert
		$plugins = $result['reports'][ self::FAKE_PLUGINS_REPORT ]['fields'][0]['value'];

		$this->assertSame( [
			[
				'Name' => 'Fake Plugin',
				'Version' => '1.2.3',
				'Author' => 'Fake Author',
			],
		], $plugins );
	}

	public function test_check_permission__rejects_editor() {
		// Arrange
		$this->act_as_editor();

		// Act & Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	private function register_fake_plugins_report(): void {
		$reporter = new class() extends Base_Plugin {
			public function get_title() {
				return 'Fake Plugins';
			}

			public function get_fields() {
				return [ 'active_plugins' => 'Active Plugins' ];
			}

			public function get_active_plugins() {
				return [
					'value' => [
						'fake/fake.php' => [
							'Name' => '<b>Fake Plugin</b>',
							'Version' => '1.2.3',
							'Author' => 'Fake Author',
							'PluginURI' => 'https://example.com',
							'Description' => 'A long description that should not reach the model.',
						],
					],
				];
			}
		};

		System_Info_Module::add_report( self::FAKE_PLUGINS_REPORT, [ 'class_name' => get_class( $reporter ) ] );
	}

	private function register_fake_usage_report(): void {
		$reporter = new class() extends Base {
			public function get_title() {
				return 'Fake Usage';
			}

			public function get_fields() {
				return [ 'usage' => 'Usage' ];
			}

			public function get_usage() {
				return [ 'value' => 'Page : 1' ];
			}
		};

		System_Info_Module::add_report( 'usage', [ 'class_name' => get_class( $reporter ) ] );
	}

	private function reports_property(): \ReflectionProperty {
		$property = new \ReflectionProperty( System_Info_Module::class, 'reports' );
		$property->setAccessible( true );

		return $property;
	}
}
