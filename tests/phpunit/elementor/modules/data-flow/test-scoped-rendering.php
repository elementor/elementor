<?php

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\DataFlow\Module as Data_Flow_Module;
use Elementor\Modules\DataFlow\State_Params;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Scoped_Rendering extends Elementor_Test_Base {
	const RENDER_HOOKS = [
		[ 'elementor/frontend/before_render', 'enter_element' ],
		[ 'elementor/frontend/after_render', 'leave_element' ],
		[ 'elementor/widget/render_content', 'render_widget_bindings' ],
		[ 'elementor/frontend/the_content', 'render_state_bindings' ],
	];

	private string $original_experiment_state;

	private ?Data_Flow_Module $registered_module;

	private Data_Flow_Module $module;

	public function setUp(): void {
		parent::setUp();

		$features = Plugin::$instance->experiments->get_features( Data_Flow_Module::EXPERIMENT_NAME );
		$this->original_experiment_state = $features['default'] ?? Experiments_Manager::STATE_INACTIVE;
		Plugin::$instance->experiments->set_feature_default_state( Data_Flow_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		$this->registered_module = Plugin::$instance->modules_manager->get_modules( 'data-flow' ) ?: null;
		$this->toggle_render_hooks( $this->registered_module, false );

		$this->module = new Data_Flow_Module();
	}

	public function tearDown(): void {
		$this->toggle_render_hooks( $this->module, false );
		remove_action( 'wp_footer', [ $this->module, 'print_data' ], 1 );
		$this->toggle_render_hooks( $this->registered_module, true );
		Plugin::$instance->experiments->set_feature_default_state( Data_Flow_Module::EXPERIMENT_NAME, $this->original_experiment_state );

		parent::tearDown();
	}

	public function test_print_element__renders_bindings_from_the_container_scope_and_tags_it() {
		// Arrange
		$container = $this->create_counter_container( 'scope1', 3 );

		// Act
		$html = $this->print_element( $container );
		$data = $this->get_footer_data();

		// Assert
		$this->assertStringContainsString( 'data-e-scope="scope1"', $html );
		$this->assertStringContainsString( 'Count: 3', $html );
		$this->assertStringNotContainsString( '{{state.count}}', $html );
		$this->assertSame( [
			[ 'id' => 'scope1', 'parentId' => null, 'state' => [ 'count' => 3 ] ],
		], $data['scopes'] );
		$this->assertSame( [ [ 'template' => 'Count: {{state.count}}', 'text' => 'Count: 3' ] ], $data['bindings'] );
	}

	public function test_print_element__sibling_containers_render_their_own_state() {
		// Arrange
		$first = $this->create_counter_container( 'first', 1 );
		$second = $this->create_counter_container( 'second', 2 );

		// Act
		$first_html = $this->print_element( $first );
		$second_html = $this->print_element( $second );

		// Assert
		$this->assertStringContainsString( 'Count: 1', $first_html );
		$this->assertStringContainsString( 'Count: 2', $second_html );
		$this->assertSame( [ 'first', 'second' ], array_column( $this->get_footer_data()['scopes'], 'id' ) );
	}

	public function test_get_raw_data__keeps_sanitized_state_params_and_state() {
		// Arrange
		$element = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => 'raw1',
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			State_Params::DATA_KEY => [
				[ 'key' => 'count', 'type' => 'number', 'default' => '4' ],
				[ 'key' => 'bad key', 'type' => 'number' ],
			],
			State_Params::VALUES_DATA_KEY => [ 'count' => 9 ],
		] );

		// Act
		$raw_data = $element->get_raw_data();

		// Assert
		$this->assertSame( [ [ 'key' => 'count', 'label' => 'count', 'type' => 'number', 'default' => 4 ] ], $raw_data[ State_Params::DATA_KEY ] );
		$this->assertSame( [ 'count' => 9 ], $raw_data[ State_Params::VALUES_DATA_KEY ] );
	}

	private function create_counter_container( string $id, int $count ) {
		$container = Plugin::$instance->elements_manager->create_element_instance( [
			'id' => $id,
			'elType' => Flexbox::get_element_type(),
			'settings' => [],
			State_Params::DATA_KEY => [ [ 'key' => 'count', 'type' => 'number', 'default' => $count ] ],
		] );

		$container->add_child( [
			'id' => $id . '-text',
			'elType' => 'widget',
			'widgetType' => Atomic_Paragraph::get_element_type(),
			'settings' => [
				'paragraph' => Escaped_Html_Prop_Type::generate( 'Count: {{state.count}}' ),
			],
		] );

		return $container;
	}

	private function print_element( $element ): string {
		ob_start();
		$element->print_element();

		return ob_get_clean();
	}

	private function toggle_render_hooks( ?Data_Flow_Module $module, bool $is_enabled ): void {
		if ( ! $module ) {
			return;
		}

		foreach ( self::RENDER_HOOKS as [ $hook, $method ] ) {
			$is_enabled ? add_filter( $hook, [ $module, $method ] ) : remove_filter( $hook, [ $module, $method ] );
		}
	}

	private function get_footer_data(): array {
		ob_start();
		$this->module->print_data();
		$output = ob_get_clean();

		preg_match( '/<script[^>]*>(.*)<\/script>/s', $output, $match );

		return json_decode( $match[1] ?? '{}', true );
	}
}
