<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\System_Info;

use Elementor\Modules\System_Info\Module;
use Elementor\Modules\System_Info\Reporters\Base;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Module extends Elementor_Test_Base {

	private const FAKE_REPORT = 'test_format_report';

	private const BUILT_IN_REPORTS = [ 'server', 'wordpress', 'theme', 'user', 'plugins', 'network_plugins', 'mu_plugins' ];

	private array $original_reports;

	public function setUp(): void {
		parent::setUp();

		$this->original_reports = $this->reports_property()->getValue();
	}

	public function tearDown(): void {
		$this->reports_property()->setValue( null, $this->original_reports );

		parent::tearDown();
	}

	public function test_get_reports_data__uses_default_getters_without_a_format() {
		// Arrange
		$this->register_fake_report();

		// Act
		$data = Plugin::$instance->system_info->get_reports_data();

		// Assert
		$this->assertSame( 'default value', $data[ self::FAKE_REPORT ]['report']['item']['value'] );
	}

	public function test_get_reports_data__uses_format_specific_getters() {
		// Arrange
		$this->register_fake_report();

		// Act
		$data = Plugin::$instance->system_info->get_reports_data( 'raw' );

		// Assert
		$this->assertSame( 'raw value', $data[ self::FAKE_REPORT ]['report']['item']['value'] );
	}

	public function test_get_allowed_reports__registers_experiments_and_log_before_compatibility_without_admin_init() {
		// Arrange
		$this->reports_property()->setValue( null, array_fill_keys( self::BUILT_IN_REPORTS, [] ) );

		// Act
		$report_names = array_keys( Module::get_allowed_reports() );

		// Assert
		$this->assertSame(
			[ 'experiments', 'log', 'elementor_compatibility' ],
			array_values( array_intersect( $report_names, [ 'experiments', 'log', 'elementor_compatibility' ] ) )
		);
	}

	private function register_fake_report(): void {
		$reporter = new class() extends Base {
			public function get_title() {
				return 'Fake';
			}

			public function get_fields() {
				return [ 'item' => 'Item' ];
			}

			public function get_item() {
				return [ 'value' => 'default value' ];
			}

			public function get_raw_item() {
				return [ 'value' => 'raw value' ];
			}
		};

		Module::add_report( self::FAKE_REPORT, [ 'class_name' => get_class( $reporter ) ] );
	}

	private function reports_property(): \ReflectionProperty {
		$property = new \ReflectionProperty( Module::class, 'reports' );
		$property->setAccessible( true );

		return $property;
	}
}
