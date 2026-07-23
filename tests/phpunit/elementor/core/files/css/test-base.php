<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Files\CSS\Base as CSS_Base;
use Elementor\Core\Files\CSS\Post as CSS_Post;
use Elementor\Core\Frontend\Widget_Content_Render_Mode;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Responsive_Control_Testing_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

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

	/**
	 * ED-24903: `write()` should write CSS via a tmp-file + atomic rename so the public
	 * URL never serves a zero-byte or partial asset. On success no `.tmp-*` sibling is left
	 * behind.
	 */
	public function test_write__uses_atomic_rename_and_leaves_no_tmp_sibling() {
		$dir       = $this->make_isolated_tmp_dir();
		$target    = $dir . '/atomic-write-target.css';
		$content   = ".elementor-999 { color: rebeccapurple; }";

		$css = $this->build_css_mock( [
			'use_external_file' => true,
			'get_path'          => $target,
			'get_content'       => $content,
		] );

		$css->write();

		$this->assertFileExists( $target );
		$this->assertSame( $content, file_get_contents( $target ) );
		$this->assertSame( [], glob( $dir . '/*.tmp-*' ), 'No tmp sibling should remain after a successful atomic write.' );

		$this->cleanup_isolated_tmp_dir( $dir );
	}

	/**
	 * ED-24903: `write()` must be a no-op when the site is on the inline print method, so
	 * inline installs are strictly unaffected.
	 */
	public function test_write__is_a_noop_when_not_using_external_file() {
		$dir    = $this->make_isolated_tmp_dir();
		$target = $dir . '/noop-target.css';

		$css = $this->build_css_mock( [
			'use_external_file' => false,
			'get_path'          => $target,
			'get_content'       => 'body {}',
		] );

		$css->write();

		$this->assertFileDoesNotExist( $target );
		$this->assertSame( [], glob( $dir . '/*.tmp-*' ) );

		$this->cleanup_isolated_tmp_dir( $dir );
	}

	/**
	 * ED-24903: reader-side self-heal helper returns `false` for inline installs.
	 */
	public function test_is_external_file_missing_or_empty__returns_false_when_inline_print_method() {
		$css = $this->build_css_mock( [
			'use_external_file' => false,
			'get_path'          => '/definitely-does-not-exist/foo.css',
			'get_content'       => '',
		] );

		$this->assertFalse( $this->invoke_missing_or_empty( $css, [ 'status' => 'file' ] ) );
	}

	/**
	 * ED-24903: reader-side self-heal helper returns `false` unless the meta explicitly
	 * says `CSS_STATUS_FILE`. Legit-empty CSS (`empty`), inline meta, and un-generated
	 * meta must not trigger a regeneration.
	 */
	public function test_is_external_file_missing_or_empty__returns_false_when_status_not_file() {
		$css = $this->build_css_mock( [
			'use_external_file' => true,
			'get_path'          => '/definitely-does-not-exist/foo.css',
			'get_content'       => '',
		] );

		$this->assertFalse( $this->invoke_missing_or_empty( $css, [ 'status' => '' ] ) );
		$this->assertFalse( $this->invoke_missing_or_empty( $css, [ 'status' => CSS_Base::CSS_STATUS_EMPTY ] ) );
		$this->assertFalse( $this->invoke_missing_or_empty( $css, [ 'status' => CSS_Base::CSS_STATUS_INLINE ] ) );
	}

	/**
	 * ED-24903: reader-side self-heal helper returns `true` when meta says CSS_STATUS_FILE
	 * but the file is missing from disk. This is the exact 10 July occurrence.
	 */
	public function test_is_external_file_missing_or_empty__returns_true_when_file_missing() {
		$dir    = $this->make_isolated_tmp_dir();
		$target = $dir . '/never-created.css';

		$css = $this->build_css_mock( [
			'use_external_file' => true,
			'get_path'          => $target,
			'get_content'       => '',
		] );

		$this->assertTrue( $this->invoke_missing_or_empty( $css, [ 'status' => CSS_Base::CSS_STATUS_FILE ] ) );

		$this->cleanup_isolated_tmp_dir( $dir );
	}

	/**
	 * ED-24903: reader-side self-heal helper returns `true` when the file exists but is
	 * zero bytes (the concurrent-write / truncated-by-host-cleanup case).
	 */
	public function test_is_external_file_missing_or_empty__returns_true_when_file_zero_bytes() {
		$dir    = $this->make_isolated_tmp_dir();
		$target = $dir . '/empty.css';
		touch( $target );

		$css = $this->build_css_mock( [
			'use_external_file' => true,
			'get_path'          => $target,
			'get_content'       => '',
		] );

		$this->assertTrue( $this->invoke_missing_or_empty( $css, [ 'status' => CSS_Base::CSS_STATUS_FILE ] ) );

		$this->cleanup_isolated_tmp_dir( $dir );
	}

	/**
	 * ED-24903: healthy sites must not trigger a regeneration on every enqueue. When the
	 * meta and disk agree on a non-empty file, the helper returns `false`.
	 */
	public function test_is_external_file_missing_or_empty__returns_false_when_file_healthy() {
		$dir    = $this->make_isolated_tmp_dir();
		$target = $dir . '/healthy.css';
		file_put_contents( $target, '.elementor-1 { color: red; }' );

		$css = $this->build_css_mock( [
			'use_external_file' => true,
			'get_path'          => $target,
			'get_content'       => '',
		] );

		$this->assertFalse( $this->invoke_missing_or_empty( $css, [ 'status' => CSS_Base::CSS_STATUS_FILE ] ) );

		$this->cleanup_isolated_tmp_dir( $dir );
	}

	/**
	 * Build a mock `Core\Files\CSS\Post` with the three methods that the write()/self-heal
	 * paths depend on stubbed to controllable values, so we can test file behaviour without
	 * booting the full document/element stack.
	 *
	 * @param array{use_external_file: bool, get_path: string, get_content: string} $stubs
	 * @return \Elementor\Core\Files\CSS\Post
	 */
	private function build_css_mock( array $stubs ) {
		$css = $this->getMockBuilder( CSS_Post::class )
			->setConstructorArgs( [ 0 ] )
			->onlyMethods( [ 'use_external_file', 'get_path', 'get_content' ] )
			->getMock();

		$css->method( 'use_external_file' )->willReturn( $stubs['use_external_file'] );
		$css->method( 'get_path' )->willReturn( $stubs['get_path'] );
		$css->method( 'get_content' )->willReturn( $stubs['get_content'] );

		return $css;
	}

	/**
	 * Invoke the protected `is_external_file_missing_or_empty()` helper via reflection.
	 */
	private function invoke_missing_or_empty( $css, array $meta ) {
		$method = new \ReflectionMethod( $css, 'is_external_file_missing_or_empty' );
		$method->setAccessible( true );

		return $method->invoke( $css, $meta );
	}

	private function make_isolated_tmp_dir() {
		$dir = sys_get_temp_dir() . '/elementor-ed24903-' . wp_generate_password( 8, false, false );
		wp_mkdir_p( $dir );

		return $dir;
	}

	private function cleanup_isolated_tmp_dir( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}

		foreach ( glob( $dir . '/*' ) as $file ) {
			@unlink( $file );
		}

		@rmdir( $dir );
	}
}
