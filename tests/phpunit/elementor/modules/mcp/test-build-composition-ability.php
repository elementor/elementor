<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Build_Composition_Ability extends Elementor_Test_Base {
	use MatchesSnapshots;

	private Documents_Manager $original_documents;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		$this->original_documents = Plugin::$instance->documents;
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;

		global $wp_scripts, $wp_styles;
		$wp_scripts = new \WP_Scripts();
		$wp_styles = new \WP_Styles();

		parent::tearDown();
	}

	public function test_execute__renders_composition() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_kit_color_variable( 'wc26-gold', '#ff0' );

		$this->given_dynamic_tags( [
			'post-excerpt' => [
				'name' => 'post-excerpt',
				'label' => 'Post Excerpt',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'length' => String_Prop_Type::make()->default( '55' ),
				],
			],
		] );

		$ability = new Build_Composition_Ability();

		$xml_structure = '<e-flexbox configuration-id="newspaper-section">'
			. '<e-flexbox configuration-id="newspaper-masthead">'
			. '<e-paragraph configuration-id="masthead-eyebrow"/>'
			. '<e-heading configuration-id="newspaper-title"/>'
			. '<e-flexbox configuration-id="masthead-meta">'
			. '<e-paragraph configuration-id="masthead-date"/>'
			. '<e-paragraph configuration-id="masthead-label"/>'
			. '</e-flexbox>'
			. '</e-flexbox>'
			. '<e-flexbox configuration-id="post-card">'
			. '<e-image configuration-id="post-image"/>'
			. '<e-flexbox configuration-id="post-content-area">'
			. '<e-paragraph configuration-id="post-meta-date"/>'
			. '<e-heading configuration-id="post-title-heading"/>'
			. '<e-divider configuration-id="post-rule"/>'
			. '<e-paragraph configuration-id="post-excerpt-text"/>'
			. '</e-flexbox>'
			. '</e-flexbox>'
			. '</e-flexbox>';

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => $xml_structure,
			'element_config' => [
				'newspaper-title' => [
					'title' => [
						'content' => 'Daily Herald',
						'children' => [],
					],
				],
				'post-title-heading' => [
					'title' => [
						'name' => 'post-excerpt',
						'settings' => [ 'length' => '55' ],
					],
				],
			'masthead-eyebrow' => [
				'paragraph' => [
					'content' => 'Breaking News',
					'children' => [],
				],
			],
			'post-image' => [
				'image' => [
					'src' => [
						'url' => 'https://example.com/post-image.jpg',
					],
					'size' => 'full',
				],
			],
		],
			'style' => [
				'newspaper-section' => [ 'color' => 'var(--wc26-gold)' ],
				'post-rule' => [ 'border-top' => '1px solid red' ],
			],
			'parent_id' => 'document',
			'dry_run' => false,
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['root_element_ids'] );
		$this->assertNotEmpty( $result['warnings'] );
		$this->assertStringContainsString( 'custom_css', implode( ' ', $result['warnings'] ) );

		$rendered = $this->render_root_elements( $post_id );
		$this->assertMatchesSnapshot( $this->normalize_snapshot( $rendered ) );
	}

	private function render_root_elements( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$output = '';

		foreach ( $elements as $element_data ) {
			$instance = Plugin::$instance->elements_manager->create_element_instance( $element_data );
			if ( ! $instance ) {
				continue;
			}

			ob_start();
			$instance->print_element();
			$output .= ob_get_clean() . "\n";
		}

		return $output;
	}

	private function given_dynamic_tags( array $tags ): void {
		$module = Dynamic_Tags_Module::fresh();

		$reflection = new \ReflectionClass( $module->registry );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, $tags );
	}

	/**
	 * @dataProvider structure_validation_cases
	 */
	public function test_execute__structure_validation( string $xml, string $expected_code ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [ 'post_id' => $post_id, 'xml_structure' => $xml ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( $expected_code, $result->get_error_code() );
	}

	public function structure_validation_cases(): array {
		return [
			'invalid xml' => [ '<e-heading>', 'invalid_xml' ],
			'unknown type' => [ '<nonexistent-widget/>', 'elementor_unknown_type' ],
			'invalid child type' => [ '<e-tabs-content-area><e-heading/></e-tabs-content-area>', 'elementor_invalid_child_type' ],
			'leaf widget rejects children' => [ '<e-heading configuration-id="h1"><e-paragraph configuration-id="p1"/></e-heading>', 'elementor_invalid_child_type' ],
			'leaf widget rejects container child' => [ '<e-image configuration-id="i1"><e-flexbox configuration-id="f1"/></e-image>', 'elementor_invalid_child_type' ],
		];
	}

	/**
	 * @dataProvider input_and_permissions_cases
	 */
	public function test_execute__input_and_permissions_validation( array $input, string $expected_code, ?int $expected_status, ?string $acting_user_role, bool $inject_post_id ) {
		// Arrange
		if ( null !== $acting_user_role ) {
			wp_set_current_user( $this->factory()->user->create( [ 'role' => $acting_user_role ] ) );
		} else {
			$this->act_as_admin();
		}

		$post_id = $this->create_real_document();
		if ( $inject_post_id ) {
			$input['post_id'] = $post_id;
		}

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( $input );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( $expected_code, $result->get_error_code() );
		if ( null !== $expected_status ) {
			$this->assertSame( $expected_status, $result->get_error_data()['status'] );
		}
	}

	public function input_and_permissions_cases(): array {
		return [
			'missing post_id' => [
				[ 'xml_structure' => '<e-heading/>' ],
				'invalid_input',
				\WP_Http::BAD_REQUEST,
				null,
				false,
			],
			'missing xml_structure' => [
				[],
				'invalid_input',
				\WP_Http::BAD_REQUEST,
				null,
				true,
			],
			'forbidden user' => [
				[ 'xml_structure' => '<e-heading/>' ],
				'elementor_forbidden',
				\WP_Http::FORBIDDEN,
				'subscriber',
				true,
			],
		];
	}

	/**
	 * @dataProvider settings_validation_cases
	 */
	public function test_execute__settings_validation( array $element_config, array $expected_message_fragments ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [ 'h1' => $element_config ],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$message = $result->get_error_message();
		foreach ( $expected_message_fragments as $fragment ) {
			$this->assertStringContainsString( $fragment, $message );
		}
	}

	public function settings_validation_cases(): array {
		return [
			'invalid tag enum' => [
				[ 'tag' => 'h99' ],
				[ 'tag', 'elementor://widgets/schema' ],
			],
			'unresolvable title type' => [
				[
					'title' => [
						'content' => [ 'not', 'a', 'string' ],
						'children' => [],
					],
				],
				[ 'title', 'could not be resolved' ],
			],
		];
	}

	public function test_execute__skips_unsupported_prop_and_warns() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-divider configuration-id="d1"/>',
			'element_config' => [
				'd1' => [
					'link' => [
						'destination' => 'https://example.com',
					],
				],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertCount( 1, $result['root_element_ids'] );
		$this->assertNotEmpty( $result['warnings'] );

		$warnings = implode( ' ', $result['warnings'] );
		$this->assertStringContainsString( 'link', $warnings );
		$this->assertStringContainsString( 'skipped', $warnings );
		$this->assertStringContainsString( 'e-divider', $warnings );
	}

	/**
	 * @dataProvider dynamic_tag_wrong_settings_cases
	 */
	public function test_execute__dynamic_tag_wrong_settings( array $title_value ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$this->given_dynamic_tags( [
			'post-excerpt' => [
				'name' => 'post-excerpt',
				'label' => 'Post Excerpt',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'length' => String_Prop_Type::make()->default( '55' ),
				],
			],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => $title_value,
				],
			],
		] );

		// Assert
		$this->assertWPError( $result, 'Expected invalid settings but got success: ' . ( is_array( $result ) ? wp_json_encode( $result ) : 'unknown' ) );
		$this->assertSame( 'elementor_invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function dynamic_tag_wrong_settings_cases(): array {
		return [
			'unknown tag name' => [
				[ 'name' => 'ghost-tag', 'settings' => [] ],
			],
		];
	}

	public function test_execute__skips_invalid_dynamic_setting_and_builds() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$this->given_dynamic_tags( [
			'post-excerpt' => [
				'name' => 'post-excerpt',
				'label' => 'Post Excerpt',
				'group' => 'post',
				'categories' => [ 'text' ],
				'props_schema' => [
					'length' => String_Prop_Type::make()->default( '55' ),
				],
			],
		] );

		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => [
						'name' => 'post-excerpt',
						'settings' => [ 'length' => [ 'not', 'a', 'string' ] ],
					],
				],
			],
		] );

		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
	}

	public function test_execute__rejects_non_object_style_block() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => 'color: #2d2a26;',
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_invalid_styles', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'h1', $result->get_error_message() );
		$this->assertStringContainsString( 'property', $result->get_error_message() );
	}

	public function test_execute__reports_custom_css_fallback_with_warning() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [ 'border-top' => '1px solid red' ],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertNotEmpty( $result['warnings'] );
		$this->assertStringContainsString( 'custom_css', implode( ' ', $result['warnings'] ) );
		$this->assertStringContainsString( 'h1', implode( ' ', $result['warnings'] ) );
	}

	public function test_execute__attaches_global_classes_by_label_before_local_styles() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$class_id = $this->given_kit_global_class( 'hero-heading', '#111111' );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'classes' => [
				'h1' => [ 'hero-heading' ],
			],
			'style' => [
				'h1' => [ 'font-size' => '2rem' ],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$heading = $elements[0] ?? null;
		$this->assertNotNull( $heading );

		$class_values = $heading['settings']['classes']['value'] ?? [];
		$this->assertContains( $class_id, $class_values );
		$this->assertSame( $class_id, $class_values[0] );
		$this->assertNotEmpty( $heading['styles'] ?? [] );
	}

	public function test_execute__rejects_unknown_global_class_label() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'classes' => [
				'h1' => [ 'missing-class' ],
			],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_unknown_global_class', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'missing-class', $result->get_error_message() );
		$this->assertStringContainsString( 'Available labels', $result->get_error_message() );
	}

	public function test_execute__resolves_global_variable_label_to_id_in_saved_tree() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$variable_id = $this->given_kit_color_variable( 'wc26-gold', '#ff0' );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'style' => [
				'h1' => [ 'color' => 'var(--wc26-gold)' ],
			],
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$heading = $elements[0] ?? null;
		$this->assertNotNull( $heading );

		$style = reset( $heading['styles'] );
		$color_prop = $style['variants'][0]['props']['color'] ?? null;
		$this->assertIsArray( $color_prop );
		$this->assertSame( 'global-color-variable', $color_prop['$$type'] ?? null );
		$this->assertSame( $variable_id, $color_prop['value'] ?? null );
	}

	private function given_kit_global_class( string $label, string $color ): string {
		( new Global_Class_Post_Type() )->register_post_type();

		$class_id = 'g-testcls';
		$data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color,
						],
					],
					'custom_css' => null,
				],
			],
		];

		Global_Class_Post::create( $class_id, $label, $data );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		Global_Classes_Order::make( $kit )->set_order( [ $class_id ] );
		Global_Classes_Labels::make( $kit )->set_labels( [ $class_id => $label ] );

		return $class_id;
	}

	private function given_kit_color_variable( string $label, string $value ): string {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$service = new Variables_Service( new Variables_Repository( $kit ), new Batch_Processor() );

		$result = $service->create( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => $label,
			'value' => $value,
		] );

		return $result['variable']['id'];
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_default_post()->ID;
	}

	private function normalize_snapshot( string $html ): string {
		$html = preg_replace( '/e-[a-f0-9]+-[a-f0-9]{4}\b/', 'e-{STYLE}', $html );
		$html = preg_replace( '/elementor-element-[a-f0-9]+/', 'elementor-element-{ID}', $html );
		$html = preg_replace( '/data-id="[a-f0-9]+"/', 'data-id="{ID}"', $html );
		$html = preg_replace( '/data-interaction-id="[a-f0-9]+"/', 'data-interaction-id="{ID}"', $html );

		return $html;
	}

	public function test_execute__mode_omitted_behaves_as_append() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'elType' => 'e-flexbox', 'id' => 'existing-1', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayNotHasKey( 'removed_element_ids', $result );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$this->assertCount( 2, $elements );
		$this->assertSame( 'existing-1', $elements[0]['id'] );
	}

	public function test_execute__mode_append_preserves_existing_children() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'elType' => 'e-flexbox', 'id' => 'existing-1', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'mode' => 'append',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayNotHasKey( 'removed_element_ids', $result );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$this->assertCount( 2, $elements );
		$this->assertSame( 'existing-1', $elements[0]['id'] );
	}

	public function test_execute__mode_replace_children_removes_existing_and_inserts_new() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[
				'elType' => 'e-flexbox',
				'id' => 'parent-container',
				'settings' => [],
				'elements' => [
					[ 'elType' => 'e-flexbox', 'id' => 'child-1', 'settings' => [], 'elements' => [] ],
					[ 'elType' => 'e-flexbox', 'id' => 'child-2', 'settings' => [], 'elements' => [] ],
				],
			],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-paragraph configuration-id="p1"/>',
			'parent_id' => 'parent-container',
			'mode' => 'replace_children',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'removed_element_ids', $result );
		$this->assertSame( [ 'child-1', 'child-2' ], $result['removed_element_ids'] );
		$this->assertCount( 1, $result['root_element_ids'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$parent = $elements[0] ?? null;
		$this->assertNotNull( $parent );
		$this->assertSame( 'parent-container', $parent['id'] );
		$this->assertCount( 1, $parent['elements'] );
		$this->assertSame( 'widget', $parent['elements'][0]['elType'] );
		$this->assertSame( 'e-paragraph', $parent['elements'][0]['widgetType'] );
	}

	public function test_execute__mode_replace_children_with_empty_parent_behaves_as_append() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[
				'elType' => 'e-flexbox',
				'id' => 'empty-parent',
				'settings' => [],
				'elements' => [],
			],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'parent_id' => 'empty-parent',
			'mode' => 'replace_children',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'removed_element_ids', $result );
		$this->assertSame( [], $result['removed_element_ids'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$parent = $elements[0] ?? null;
		$this->assertNotNull( $parent );
		$this->assertCount( 1, $parent['elements'] );
	}

	public function test_execute__mode_replace_children_on_document_root_wipes_all_elements() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'elType' => 'e-flexbox', 'id' => 'root-1', 'settings' => [], 'elements' => [] ],
			[ 'elType' => 'e-flexbox', 'id' => 'root-2', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="new-heading"/>',
			'parent_id' => 'document',
			'mode' => 'replace_children',
		] );

		// Assert
		$this->assertIsArray( $result, 'Expected success array but got: ' . ( is_wp_error( $result ) ? $result->get_error_message() : 'unknown' ) );
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'removed_element_ids', $result );
		$this->assertSame( [ 'root-1', 'root-2' ], $result['removed_element_ids'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$this->assertCount( 1, $elements );
		$this->assertSame( 'widget', $elements[0]['elType'] );
		$this->assertSame( 'e-heading', $elements[0]['widgetType'] );
	}

	public function test_execute__mode_replace_children_with_nonexistent_parent_returns_error() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$this->given_document_with_elements( $post_id, [
			[ 'elType' => 'e-flexbox', 'id' => 'existing-1', 'settings' => [], 'elements' => [] ],
		] );

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'parent_id' => 'nonexistent-parent',
			'mode' => 'replace_children',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'elementor_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );

		$document = Plugin::$instance->documents->get( $post_id );
		$elements = $document->get_elements_data();
		$this->assertCount( 1, $elements );
		$this->assertSame( 'existing-1', $elements[0]['id'] );
	}

	public function test_execute__invalid_mode_returns_error() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		$ability = new Build_Composition_Ability();

		// Act
		$result = $ability->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'mode' => 'invalid_mode',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'invalid_mode', $result->get_error_message() );
		$this->assertStringContainsString( 'append', $result->get_error_message() );
		$this->assertStringContainsString( 'replace_children', $result->get_error_message() );
	}

	private function given_document_with_elements( int $post_id, array $elements ): void {
		$document = Plugin::$instance->documents->get( $post_id );
		$document->save( [ 'elements' => $elements ] );

		$this->clear_document_cache( $post_id );
	}

	private function clear_document_cache( int $post_id ): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$documents = $reflection->getValue( Plugin::$instance->documents );
		unset( $documents[ $post_id ] );
		$reflection->setValue( Plugin::$instance->documents, $documents );
	}
}
