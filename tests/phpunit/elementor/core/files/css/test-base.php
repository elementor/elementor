<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Files\CSS\Base as CSS_Base;
use Elementor\Core\Frontend\Widget_Content_Render_Mode;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Responsive_Control_Testing_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * A minimal, directly instantiable `CSS\Base` subclass used to exercise `enqueue()` /
 * `update()` / `write()` self-heal behaviour without depending on the post/document
 * pipeline (mirrors the isolation `Test_Css_Files_Manager` gets for the atomic side).
 */
class Optimized_Css_Files_Test_File extends CSS_Base {
	const META_KEY = 'elementor_test_optimized_css_files_meta';

	private $css_content = 'body { color: red; }';

	private $write_should_fail = false;

	public function get_name() {
		return 'test-optimized-css-files';
	}

	protected function get_file_handle_id() {
		return 'elementor-test-optimized-css-files';
	}

	protected function render_css() {
		$this->get_stylesheet()->add_raw_css( $this->css_content );
	}

	public function set_css_content( $css ) {
		$this->css_content = $css;
	}

	public function set_write_should_fail( $should_fail ) {
		$this->write_should_fail = $should_fail;
	}

	public function write() {
		if ( $this->write_should_fail ) {
			return false;
		}

		return parent::write();
	}
}

/**
 * Test the CSS Base class
 */
class Test_Base extends Elementor_Test_Base {

	use Responsive_Control_Testing_Trait;

	/**
	 * @var \Elementor\Core\Files\CSS\Post
	 */
	private $css_generator_class;

	/**
	 * @var array
	 */
	private $mock_control;

	private $control_with_responsive_selector_desktop_value = [
		'name' => 'test_responsive_selector',
		'type' => 'slider',
		'selectors' => [
			'(mobile){{WRAPPER}}' => 'width: {{_element_custom_width.SIZE}}{{_element_custom_width.UNIT}};',
		],
	];

	private $control_with_responsive_selector_mobile_value = [
		'name' => 'test_responsive_selector_mobile',
		'type' => 'slider',
		'selectors' => [
			'(mobile){{WRAPPER}}' => 'width: {{_element_custom_width_mobile.SIZE}}{{_element_custom_width_mobile.UNIT}};',
		],
	];

	/**
	 * Element with a responsive condition
	 *
	 * @var array
	 */
	static $element_mock = [
		'id' => '5b2c8e4',
		'elType' => 'widget',
		'isInner' => false,
		'settings' => [
			'_element_width' => '',
			'_element_width_mobile' => 'initial',
			'_element_custom_width' => [
				'size' => 30,
				'unit' => 'px',
			],
			'_element_custom_width_mobile' => [
				'size' => 20,
				'unit' => 'px',
			],
			'test_responsive_selector' => [
				'size' => '',
				'unit' => 'px',
			],
			'test_responsive_selector_mobile' => [
				'size' => '',
				'unit' => 'px',
			],
		],
		'elements' => [],
		'widgetType' => 'button',
	];

	/**
	 * @var array[]
	 */
	private $mock_controls_array;

	/**
	 * @var array
	 */
	private $control_with_units_selectors_dictionary;

	/**
	 * @var array[]
	 */
	private $control_with_units_selectors_dictionary_array;

	public function setUp(): void {
		parent::setUp();

		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		$this->css_generator_class = new \Elementor\Core\Files\CSS\Post( 0 );

		$this->mock_control = [
			'name' => 'number',
			'type' => 'number',
			'default' => 20,
		];

		$this->mock_controls_array = [
			'number' => $this->mock_control,
		];

		$this->control_with_units_selectors_dictionary = [
			'label' => 'Columns',
			'type' => 'slider',
			'range' => [
				'fr' => [
					'min' => 1,
					'max' => 12,
					'step' => 1,
				],
			],
			'size_units' => [ 'fr', 'custom' ],
			'unit_selectors_dictionary' => [
				'custom' => '--e-con-grid-template-columns: {{SIZE}}',
			],
			'default' => [
				'unit' => 'fr',
				'size' => 3,
			],
			'selectors' => [
				'{{SELECTOR}}' => '--e-con-grid-template-columns: repeat({{SIZE}}, 1fr)',
			],
			'responsive' => true,
		];

		$this->control_with_units_selectors_dictionary_array = [
			'columns_grid' => $this->control_with_units_selectors_dictionary,
		];
	}

	public function test_parse_property_placeholder__value_0_integer() {
		// Arrange.
		$value = 0;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_0_string() {
		// Arrange.
		$value = '0';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_empty_string() {
		// Arrange.
		$value = '';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( null, $control_value );
	}

	public function test_parse_property_placeholder__value_null() {
		// Arrange.
		$value = null;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__custom_size_unit() {
		// Arrange.
		$value = [
			'unit' => 'custom',
			'size' => '1fr 2fr 1fr 100px',
			'sizes' => [],
		];

		// Act
		$control_value = $this->get_parsed_unit_value( $value );

		// Assert.
		$this->assertEquals( $value['size'], $control_value );
	}

	public function test_parse_property_placeholder__default_size_unit() {
		// Arrange.
		$value = [
			'unit' => 'fr',
			'size' => '2',
			'sizes' => [],
		];

		// Act
		$control_value = $this->get_parsed_unit_value( $value );

		// Assert.
		$this->assertEquals( $value['size'], $control_value );
	}

	/**
	 * Test parsing and adding rules to a stylesheet for a control with a responsive selector.
	 */
	public function test_add_controls_stack_style_rules_responsive_selector_desktop_control_value() {
		// Arrange
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		$this->setup_responsive_control_condition_test();

		$element_instance = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		$this->mock_controls_array['test_responsive_selector'] = $this->control_with_responsive_selector_desktop_value;

		$selector = $this->css_generator_class->get_element_unique_selector( $element_instance );

		// Act
		$rules = $this->add_and_return_rules( $element_instance, $selector );

		$this->assertEquals( '30px', $rules['max_mobile'][ $selector ]['width'] );

		// Cleanup
		unset( $this->mock_controls_array['test_responsive_selector'] );

		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_duplication_mode );
	}

	public function test_add_controls_stack_style_rules_responsive_selector_mobile_control_value() {
		// Arrange
		$initial_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();

		$this->setup_responsive_control_condition_test();

		$element_instance = Plugin::$instance->elements_manager->create_element_instance( self::$element_mock );

		$this->mock_controls_array['test_responsive_selector_mobile'] = $this->control_with_responsive_selector_mobile_value;

		$selector = $this->css_generator_class->get_element_unique_selector( $element_instance );

			// Act
		$rules = $this->add_and_return_rules( $element_instance, $selector );

		// Assert
		$this->assertEquals( '20px', $rules['max_mobile'][ $selector ]['width'] );

		// Cleanup
		unset( $this->mock_controls_array['test_responsive_selector'] );

		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_duplication_mode );
	}

	private function add_and_return_rules( $element_instance, $selector ) {
		$this->css_generator_class->add_controls_stack_style_rules(
			$element_instance,
			$this->mock_controls_array,
			$element_instance->get_settings(),
			[ '{{WRAPPER}}' ],
			[ $selector ]
		);

		$stylesheet = $this->css_generator_class->get_stylesheet();

		return $stylesheet->get_rules();
	}

	private function get_parsed_value( $value ) {
		return $this->css_generator_class->parse_property_placeholder(
			$this->mock_control,
			$value,
			$this->mock_controls_array,
			function() {},
			''
		);
	}

	private function get_parsed_unit_value( $value ) {
		return $this->css_generator_class->parse_property_placeholder(
			$this->control_with_units_selectors_dictionary,
			$value,
			$this->control_with_units_selectors_dictionary_array,
			function() {},
			'SIZE'
		);
	}

	public function test_should_skip_enqueue_when_rendering_markdown() {
		Widget_Content_Render_Mode::set_current( Widget_Content_Render_Mode::MARKDOWN );

		$method = new \ReflectionMethod( $this->css_generator_class, 'should_skip_enqueue' );
		$method->setAccessible( true );

		$this->assertTrue( $method->invoke( $this->css_generator_class ) );

		Widget_Content_Render_Mode::set_current( Widget_Content_Render_Mode::NORMAL );
	}

	public function test_should_skip_enqueue_in_editor_request() {
		$_REQUEST['action'] = 'elementor';

		$method = new \ReflectionMethod( $this->css_generator_class, 'should_skip_enqueue' );
		$method->setAccessible( true );

		$this->assertTrue( $method->invoke( $this->css_generator_class ) );

		unset( $_REQUEST['action'] );
	}

	public function test_get_registered_enqueue_dependencies_filters_unregistered_handles() {
		$css = $this->getMockBuilder( \Elementor\Core\Files\CSS\Post::class )
			->setConstructorArgs( [ 0 ] )
			->onlyMethods( [ 'get_enqueue_dependencies' ] )
			->getMock();

		$css->method( 'get_enqueue_dependencies' )->willReturn( [
			'registered-handle',
			'unregistered-handle',
		] );

		wp_register_style( 'registered-handle', 'https://example.com/style.css' );

		$method = new \ReflectionMethod( $css, 'get_registered_enqueue_dependencies' );
		$method->setAccessible( true );

		$this->assertSame( [ 'registered-handle' ], $method->invoke( $css ) );

		wp_deregister_style( 'registered-handle' );
	}

	// region Step 2 — filesystem self-heal (`e_optimized_css_files`).

	public function tearDown(): void {
		parent::tearDown();

		delete_option( Optimized_Css_Files_Test_File::META_KEY );

		$file = $this->make_optimized_css_files_test_file();

		if ( file_exists( $file->get_path() ) ) {
			unlink( $file->get_path() );
		}

		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_INACTIVE );

		// `CSS\Base::$printed` is a static, per-process "already enqueued this handle" cache;
		// reset it so each test starts with a clean slate regardless of test execution order.
		$printed_property = new \ReflectionProperty( CSS_Base::class, 'printed' );
		$printed_property->setAccessible( true );
		$printed_property->setValue( null, [] );
	}

	private function make_optimized_css_files_test_file(): Optimized_Css_Files_Test_File {
		return new Optimized_Css_Files_Test_File( 'optimized-css-files-test.css' );
	}

	private function set_optimized_css_files_experiment( $state ) {
		Plugin::$instance->experiments->set_feature_default_state( 'e_optimized_css_files', $state );
	}

	private function seed_file_status_meta( Optimized_Css_Files_Test_File $file ) {
		update_option( Optimized_Css_Files_Test_File::META_KEY, [
			'time' => time(),
			'status' => CSS_Base::CSS_STATUS_FILE,
			'css' => '',
			'fonts' => [],
			'icons' => [],
			'dynamic_elements_ids' => [],
		] );
	}

	public function test_enqueue__self_heals_when_status_file_but_file_missing_and_experiment_active() {
		// Arrange.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();
		$this->seed_file_status_meta( $file );

		$this->assertFileDoesNotExist( $file->get_path() );

		// Act.
		$file->enqueue();

		// Assert.
		$this->assertFileExists( $file->get_path(), 'A missing file must be regenerated on enqueue when the experiment is active.' );
		$this->assertNotEmpty( file_get_contents( $file->get_path() ) );
		$this->assertEquals( CSS_Base::CSS_STATUS_FILE, $file->get_meta( 'status' ) );
		$this->assertTrue( wp_style_is( 'elementor-test-optimized-css-files', 'enqueued' ) );
	}

	public function test_enqueue__self_heals_when_status_file_but_file_is_zero_bytes_and_experiment_active() {
		// Arrange.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();
		$this->seed_file_status_meta( $file );

		file_put_contents( $file->get_path(), '' );
		$this->assertFileExists( $file->get_path() );
		$this->assertEquals( 0, filesize( $file->get_path() ) );

		// Act.
		$file->enqueue();

		// Assert.
		$this->assertGreaterThan( 0, filesize( $file->get_path() ), 'A zero-byte file must be regenerated on enqueue when the experiment is active.' );
		$this->assertEquals( CSS_Base::CSS_STATUS_FILE, $file->get_meta( 'status' ) );
	}

	public function test_enqueue__does_not_self_heal_when_experiment_inactive() {
		// Arrange — experiment left at its default (inactive) state.
		$file = $this->make_optimized_css_files_test_file();
		$this->seed_file_status_meta( $file );

		$this->assertFileDoesNotExist( $file->get_path() );

		// Act.
		$file->enqueue();

		// Assert — today's behaviour is preserved: no `file_exists()` check, the (missing)
		// file's URL is still enqueued, and the meta status is left untouched.
		$this->assertFileDoesNotExist( $file->get_path() );
		$this->assertEquals( CSS_Base::CSS_STATUS_FILE, $file->get_meta( 'status' ) );
		$this->assertTrue( wp_style_is( 'elementor-test-optimized-css-files', 'enqueued' ) );
	}

	public function test_enqueue__does_not_self_heal_zero_byte_file_when_experiment_inactive() {
		// Arrange.
		$file = $this->make_optimized_css_files_test_file();
		$this->seed_file_status_meta( $file );

		file_put_contents( $file->get_path(), '' );

		// Act.
		$file->enqueue();

		// Assert — zero-byte file is served as-is, matching current (pre-Step-2) behaviour.
		$this->assertFileExists( $file->get_path() );
		$this->assertEquals( 0, filesize( $file->get_path() ) );
		$this->assertEquals( CSS_Base::CSS_STATUS_FILE, $file->get_meta( 'status' ) );
	}

	public function test_enqueue__self_heals_to_inline_when_missing_file_regen_write_fails() {
		// Arrange — meta says `file`, the file is missing (self-heal trigger), and the
		// regeneration attempt itself fails to write (e.g. read-only uploads dir).
		// Requirement 3 in the plan: a failed regeneration must serve inline CSS on
		// *this* request rather than enqueueing a URL for a file that still doesn't exist.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();
		$this->seed_file_status_meta( $file );
		$file->set_write_should_fail( true );

		$this->assertFileDoesNotExist( $file->get_path() );

		// Act.
		ob_start();
		$file->enqueue();
		$output = ob_get_clean();

		// Assert.
		$this->assertFileDoesNotExist( $file->get_path(), 'A failed regen must not leave a partial file behind.' );
		$this->assertEquals( CSS_Base::CSS_STATUS_INLINE, $file->get_meta( 'status' ), 'Meta must reflect inline, not a `file` status pointing at nothing.' );
		$this->assertStringContainsString( '<style', $output, 'The inline fallback must actually be printed on this request.' );
		$this->assertStringContainsString( 'body { color: red; }', $output );
		$this->assertFalse( wp_style_is( 'elementor-test-optimized-css-files', 'enqueued' ), 'Must not enqueue a stylesheet URL for a file that was never written.' );
	}

	public function test_update__falls_back_to_inline_status_when_write_fails_and_experiment_active() {
		// Arrange.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();
		$file->set_write_should_fail( true );

		// Act.
		$file->update();

		// Assert.
		$this->assertEquals( CSS_Base::CSS_STATUS_INLINE, $file->get_meta( 'status' ) );
		$this->assertEquals( 'body { color: red; }', $file->get_meta( 'css' ) );
		$this->assertFileDoesNotExist( $file->get_path() );
	}

	public function test_update__keeps_file_status_on_write_failure_when_experiment_inactive() {
		// Arrange — experiment left inactive: today's behaviour (write failure is silent).
		$file = $this->make_optimized_css_files_test_file();
		$file->set_write_should_fail( true );

		// Act.
		$file->update();

		// Assert.
		$this->assertEquals( CSS_Base::CSS_STATUS_FILE, $file->get_meta( 'status' ) );
	}

	public function test_write__successful_write_is_never_observed_as_zero_byte() {
		// Arrange.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();
		$file->set_css_content( str_repeat( 'a { color: red; }', 500 ) );

		// Act.
		$file->update();

		// Assert — the final file at the public path is either absent or fully written;
		// a partial/zero-byte state must never be observable once the write has completed.
		$this->assertFileExists( $file->get_path() );
		$this->assertGreaterThan( 0, filesize( $file->get_path() ) );
		$this->assertStringContainsString( 'a { color: red; }', file_get_contents( $file->get_path() ) );

		// No leftover temp file should remain after a successful atomic write.
		$leftover_tmp_files = glob( $file->get_path() . '.tmp-*' );
		$this->assertEmpty( $leftover_tmp_files, 'No temp file should remain after a successful atomic write.' );
	}

	public function test_write__uses_atomic_temp_file_and_rename_when_experiment_active() {
		// Arrange.
		$this->set_optimized_css_files_experiment( Experiments_Manager::STATE_ACTIVE );

		$file = $this->make_optimized_css_files_test_file();

		$method = new \ReflectionMethod( $file, 'write_atomically' );
		$method->setAccessible( true );

		$content_property = new \ReflectionProperty( \Elementor\Core\Files\Base::class, 'content' );
		$content_property->setAccessible( true );
		$content_property->setValue( $file, 'body { color: blue; }' );

		// Act.
		$result = $method->invoke( $file );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFileExists( $file->get_path() );
		$this->assertEquals( 'body { color: blue; }', file_get_contents( $file->get_path() ) );
		$this->assertEmpty( glob( $file->get_path() . '.tmp-*' ) );
	}

	// endregion
}
