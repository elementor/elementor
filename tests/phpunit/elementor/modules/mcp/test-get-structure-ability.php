<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Get_Structure_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Get_Structure_Ability extends Elementor_Test_Base {

	private Get_Structure_Ability $ability;
	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Get_Structure_Ability();
		$this->original_documents = Plugin::$instance->documents;
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		parent::tearDown();
	}

	public function test_execute__returns_400_when_post_id_is_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_id', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_user_cannot_edit_post() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_view', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_document_not_found() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( null );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'document_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_post_not_built_with_elementor() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'not_elementor', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_document_not_editable_by_user() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_view', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_pruned_skeleton_on_success() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'container1',
				'elType' => 'container',
				'settings' => [ 'padding' => '20px', 'color' => '#fff' ],
				'styles' => [ 's-1' => [ 'variants' => [] ] ],
				'elements' => [
					[
						'id' => 'widget1',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [ 'title' => 'Hello' ],
						'styles' => [],
						'elements' => [],
					],
				],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame(
			[
				[
					'id' => 'container1',
					'elType' => 'container',
					'title' => 'Container',
					'elements' => [
						[
							'id' => 'widget1',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'title' => 'Heading',
						],
					],
				],
			],
			$result['elements']
		);
	}

	public function test_execute__returns_only_matching_subtree_when_element_id_given() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'container1',
				'elType' => 'container',
				'elements' => [
					[ 'id' => 'widget1', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [ 'x' => 1 ] ],
					[ 'id' => 'widget2', 'elType' => 'widget', 'widgetType' => 'e-button', 'settings' => [ 'x' => 2 ] ],
				],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'element_id' => 'widget2' ] );

		// Assert
		$this->assertSame(
			[
				[ 'id' => 'widget2', 'elType' => 'widget', 'widgetType' => 'e-button', 'title' => 'Button' ],
			],
			$result['elements']
		);
	}

	public function test_execute__returns_404_when_element_id_not_found() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [ [ 'id' => 'container1', 'elType' => 'container', 'elements' => [] ] ];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'element_id' => 'missing' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'element_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_empty_elements_array_when_null() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( null );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( [], $result['elements'] );
	}

	public function test_execute__returns_400_when_include_content_without_element_id() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( [] );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'include_content' => true ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_input', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__includes_settings_and_styles_for_subtree_when_include_content_true() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$custom_css_raw = base64_encode( 'outline: none;' ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Test fixture.

		$elements = [
			[
				'id' => 'container1',
				'elType' => 'widget',
				'widgetType' => 'e-flexbox',
				'settings' => [
					'tag' => [
						'$$type' => 'string',
						'value' => 'section',
					],
				],
				'styles' => [
					's-abc' => [
						'id' => 's-abc',
						'type' => 'class',
						'label' => 'local',
						'variants' => [
							[
								'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
								'props' => [
									'color' => [ '$$type' => 'color', 'value' => '#fff' ],
								],
								'custom_css' => [ 'raw' => $custom_css_raw ],
							],
						],
					],
				],
				'elements' => [
					[
						'id' => 'widget1',
						'elType' => 'widget',
						'widgetType' => 'e-heading',
						'settings' => [
							'title' => [
								'$$type' => 'escaped-html',
								'value' => 'Hello',
							],
						],
						'styles' => [],
						'elements' => [],
					],
				],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'container1',
			'include_content' => true,
		] );

		// Assert
		$this->assertIsArray( $result );
		$root = $result['elements'][0];

		$this->assertSame( 'container1', $root['id'] );
		$this->assertSame(
			[ 'tag' => 'section' ],
			$root['settings']
		);
		$this->assertSame( 's-abc', $root['styles']['__style_id'] );
		$this->assertStringContainsString( 'color: #fff;', $root['styles']['css'] );
		$this->assertStringContainsString( 'outline: none;', $root['styles']['css'] );

		$child = $root['elements'][0];
		$this->assertSame( 'widget1', $child['id'] );
		$this->assertSame(
			[ 'title' => 'Hello' ],
			$child['settings']
		);
		$this->assertSame( [ 'css' => '' ], $child['styles'] );
	}

	public function test_execute__styles_empty_when_only_global_class_refs() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'classes' => [
						'$$type' => 'classes',
						'value' => [ 'g-abc' ],
					],
				],
				'styles' => [],
				'elements' => [],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'widget1',
			'include_content' => true,
		] );

		// Assert
		$node = $result['elements'][0];
		$this->assertSame(
			[ 'classes' => [ 'g-abc' ] ],
			$node['settings']
		);
		$this->assertSame( [ 'css' => '' ], $node['styles'] );
	}

	public function test_execute__serializes_realistic_local_style_id_with_e_prefix() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$style_id = 'e-widget1-abc1234';

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [],
				'styles' => [
					$style_id => [
						'id' => $style_id,
						'type' => 'class',
						'label' => 'local',
						'variants' => [
							[
								'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
								'props' => [
									'color' => [ '$$type' => 'color', 'value' => '#123456' ],
								],
								'custom_css' => null,
							],
						],
					],
				],
				'elements' => [],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'widget1',
			'include_content' => true,
		] );

		// Assert
		$styles = $result['elements'][0]['styles'];
		$this->assertSame( $style_id, $styles['__style_id'] );
		$this->assertStringContainsString( 'color: #123456;', $styles['css'] );
	}

	public function test_execute__serializes_media_and_pseudo_variants_as_raw_css() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mobile_variant = [
			'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
			'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ],
			'custom_css' => null,
		];
		$desktop_variant = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
			'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ],
			'custom_css' => null,
		];
		$hover_variant = [
			'meta' => [ 'breakpoint' => 'desktop', 'state' => 'hover' ],
			'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#0f0' ] ],
			'custom_css' => null,
		];

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [],
				'styles' => [
					's-xyz' => [
						'id' => 's-xyz',
						'type' => 'class',
						'label' => 'local',
						'variants' => [ $desktop_variant, $hover_variant, $mobile_variant ],
					],
				],
				'elements' => [],
			],
		];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'widget1',
			'include_content' => true,
		] );

		// Assert
		$styles = $result['elements'][0]['styles'];
		$this->assertSame( 's-xyz', $styles['__style_id'] );
		$this->assertStringContainsString( 'color: #fff;', $styles['css'] );
		$this->assertStringContainsString( '&:hover { color: #0f0; }', $styles['css'] );
		$this->assertStringContainsString( '@media(--mobile) {', $styles['css'] );
		$this->assertStringContainsString( 'color: #000;', $styles['css'] );
		$this->assertArrayNotHasKey( '__variants', $styles );
		$this->assertArrayNotHasKey( '__custom_css', $styles );
	}

	public function test_execute__includes_editor_settings_title_in_skeleton() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'editor_settings' => [ 'title' => 'Hero Section' ],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Hero Section', $result['elements'][0]['title'] );
	}

	public function test_execute__falls_back_to_title_setting() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [ '_title' => 'Legacy Custom Title' ],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Legacy Custom Title', $result['elements'][0]['title'] );
	}

	public function test_execute__falls_back_to_preset_title() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [ 'presetTitle' => 'Preset Title' ],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Preset Title', $result['elements'][0]['title'] );
	}

	public function test_execute__falls_back_to_widget_type_label() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Heading', $result['elements'][0]['title'] );
	}

	public function test_execute__prefers_editor_settings_title_over_title_setting() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'editor_settings' => [ 'title' => 'Editor Title' ],
				'settings' => [ '_title' => 'Legacy Title' ],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Editor Title', $result['elements'][0]['title'] );
	}

	public function test_execute__extracts_title_from_envelope_setting() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'widget1',
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'settings' => [
					'_title' => [
						'$$type' => 'string',
						'value' => 'Envelope Title',
					],
				],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertSame( 'Envelope Title', $result['elements'][0]['title'] );
	}

	public function test_execute__omits_version_from_skeleton() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'container1',
				'elType' => 'container',
				'elements' => [
					[ 'id' => 'v3', 'elType' => 'widget', 'widgetType' => 'heading', 'settings' => [] ],
					[ 'id' => 'v4', 'elType' => 'widget', 'widgetType' => 'e-heading', 'settings' => [] ],
				],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$container = $result['elements'][0];
		$this->assertArrayNotHasKey( 'version', $container );
		$this->assertArrayNotHasKey( 'version', $container['elements'][0] );
		$this->assertArrayNotHasKey( 'version', $container['elements'][1] );
	}

	public function test_execute__strips_non_allowlisted_v3_settings_and_styles_when_include_content_true() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'legacy1',
				'elType' => 'widget',
				'widgetType' => 'heading',
				'settings' => [ 'title' => 'Legacy value', 'align' => 'center' ],
				'styles' => [ 's-1' => [ 'variants' => [] ] ],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'legacy1',
			'include_content' => true,
		] );

		// Assert
		$node = $result['elements'][0];
		$this->assertArrayNotHasKey( 'version', $node );
		$this->assertEquals( (object) [], $node['settings'] );
		$this->assertSame( [ 'css' => '' ], $node['styles'] );
	}

	public function test_execute__serializes_allowlisted_v3_style_when_include_content_true() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'post-title-1',
				'elType' => 'widget',
				'widgetType' => 'theme-post-title',
				'settings' => [
					'title' => 'Hello',
					'title_color' => '#222222',
					'custom_css' => 'selector { filter: blur(2px); }',
				],
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => 'post-title-1',
			'include_content' => true,
		] );

		// Assert
		$node = $result['elements'][0];
		$this->assertArrayNotHasKey( 'version', $node );
		$this->assertArrayNotHasKey( 'style', $node );
		$this->assertSame( [ 'title' => 'Hello' ], $node['settings'] );
		$this->assertStringContainsString( 'color: #222222;', $node['styles']['css'] );
		$this->assertStringContainsString( 'filter: blur(2px);', $node['styles']['css'] );
	}

	public function test_execute__omits_version_for_unknown_type() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$elements = [
			[
				'id' => 'unknown1',
				'elType' => 'widget',
				'widgetType' => 'this-type-does-not-exist',
				'elements' => [],
			],
		];

		$this->mock_document_with_elements( $post_id, $elements );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertArrayNotHasKey( 'version', $result['elements'][0] );
	}

	public function test_execute__serializes_dynamic_tag_binding_not_rendered_output() {
		// Arrange
		$this->given_dynamic_tags( [
			'mock-price-tag' => [
				'name' => 'mock-price-tag',
				'label' => 'Mock Price',
				'group' => 'woocommerce',
				'categories' => [ 'text' ],
				'props_schema' => [
					'format' => String_Prop_Type::make()->default( 'both' ),
				],
			],
		] );

		$raw_settings = [
			'paragraph' => Dynamic_Prop_Type::generate( [
				'name' => 'mock-price-tag',
				'group' => 'woocommerce',
				'settings' => [
					'format' => String_Prop_Type::generate( 'both' ),
				],
			] ),
			'tag' => [
				'$$type' => 'string',
				'value' => 'p',
			],
		];

		$config = Widget_Context_Helper::get_widget_config( 'e-paragraph' );
		$props_schema = $config['atomic_props_schema'] ?? [];

		$method = new \ReflectionMethod( Get_Structure_Ability::class, 'serialize_settings_for_llm' );
		$method->setAccessible( true );

		// Act
		$settings = $method->invoke( $this->ability, $props_schema, $raw_settings );

		// Assert
		$this->assertSame(
			[
				'name' => 'mock-price-tag',
				'settings' => [
					'format' => 'both',
				],
			],
			$settings['paragraph']
		);
		$this->assertSame( 'p', $settings['tag'] );
	}

	public function test_execute__returns_link_in_writable_shape_and_keeps_rendered_tag() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'button1', 'e-button', [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [ '$$type' => 'url', 'value' => 'https://example.com' ],
						'isTargetBlank' => [ '$$type' => 'boolean', 'value' => true ],
						'tag' => [ '$$type' => 'string', 'value' => 'a' ],
					],
				],
			] ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'button1' );

		// Assert
		$this->assertEquals(
			[
				'destination' => 'https://example.com',
				'isTargetBlank' => true,
				'tag' => 'a',
			],
			$node['settings']['link']
		);
		$this->assertSame( 'a', $node['tag'] );
	}

	public function test_execute__returns_image_in_writable_shape() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'image1', 'e-image', [
				'image' => [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'url' => [ '$$type' => 'url', 'value' => 'https://example.com/photo.jpg' ],
								'alt' => [ '$$type' => 'string', 'value' => 'A photo' ],
							],
						],
						'size' => [ '$$type' => 'string', 'value' => 'full' ],
					],
				],
			] ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'image1' );

		// Assert
		$this->assertEquals(
			[
				'src' => [
					'id' => null,
					'url' => 'https://example.com/photo.jpg',
					'alt' => 'A photo',
				],
				'size' => 'full',
			],
			$node['settings']['image']
		);
	}

	public function test_execute__returns_svg_source_instead_of_inline_markup() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'svg1', 'e-svg', [
				'svg' => [
					'$$type' => 'svg-src',
					'value' => [
						'url' => [ '$$type' => 'url', 'value' => 'https://example.com/icon.svg' ],
					],
				],
			] ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'svg1' );

		// Assert
		$this->assertEquals(
			[
				'id' => null,
				'url' => 'https://example.com/icon.svg',
			],
			$node['settings']['svg']
		);
	}

	public function test_execute__returns_attributes_as_key_value_list() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'block1', 'e-div-block', [
				'attributes' => [
					'$$type' => 'attributes',
					'value' => [
						[
							'$$type' => 'key-value',
							'value' => [
								'key' => [ '$$type' => 'string', 'value' => 'data-section' ],
								'value' => [ '$$type' => 'string', 'value' => 'hero' ],
							],
						],
					],
				],
			], 'e-div-block' ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'block1' );

		// Assert
		$this->assertEquals(
			[
				[
					'key' => 'data-section',
					'value' => 'hero',
				],
			],
			$node['settings']['attributes']
		);
	}

	public function test_execute__returns_decorative_editor_setting_separately_from_settings() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$decorative_block = $this->make_atomic_widget( 'block1', 'e-div-block', [], 'e-div-block' );
		$decorative_block['editor_settings'] = [ 'decorative' => true ];

		$this->mock_document_with_elements( $post_id, [ $decorative_block ] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'block1' );

		// Assert
		$this->assertSame( [ 'decorative' => true ], $node['editor_settings'] );
		$this->assertArrayNotHasKey( 'decorative', (array) $node['settings'] );
	}

	public function test_execute__returns_atomic_layer_name_as_editor_setting_name() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$heading = $this->make_atomic_widget( 'heading1', 'e-heading', [] );
		$heading['editor_settings'] = [ 'title' => 'Hero Title' ];

		$this->mock_document_with_elements( $post_id, [ $heading ] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'heading1' );

		// Assert
		$this->assertSame( [ 'name' => 'Hero Title' ], $node['editor_settings'] );
		$this->assertArrayNotHasKey( 'name', (array) $node['settings'] );
	}

	public function test_execute__returns_legacy_layer_name_as_editor_setting_name() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$legacy_heading = [
			'id' => 'legacy1',
			'elType' => 'widget',
			'widgetType' => 'heading',
			'settings' => [ '_title' => 'Legacy Hero' ],
			'elements' => [],
		];

		$this->mock_document_with_elements( $post_id, [ $legacy_heading ] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'legacy1' );

		// Assert
		$this->assertSame( [ 'name' => 'Legacy Hero' ], $node['editor_settings'] );
	}

	public function test_execute__omits_editor_settings_when_nothing_is_set() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'block1', 'e-div-block', [], 'e-div-block' ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'block1' );

		// Assert
		$this->assertArrayNotHasKey( 'editor_settings', $node );
	}

	public function test_execute__decorative_keeps_frontend_base_styles_in_default_styles() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$decorative_block = $this->make_atomic_widget( 'decorative1', 'e-div-block', [], 'e-div-block' );
		$decorative_block['editor_settings'] = [ 'decorative' => true ];

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'plain1', 'e-div-block', [], 'e-div-block' ),
			$decorative_block,
		] );

		// Act
		$plain = $this->read_node_with_content( $post_id, 'plain1' );
		$decorative = $this->read_node_with_content( $post_id, 'decorative1' );

		// Assert
		$this->assertSame( $plain['default_styles'], $decorative['default_styles'] );
		$this->assertStringContainsString( 'padding:10px', $decorative['default_styles'] );
		$this->assertStringContainsString( 'min-width:30px', $decorative['default_styles'] );
	}

	public function test_execute__omits_decorative_when_editor_setting_is_absent() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$this->mock_document_with_elements( $post_id, [
			$this->make_atomic_widget( 'block1', 'e-div-block', [], 'e-div-block' ),
		] );

		// Act
		$node = $this->read_node_with_content( $post_id, 'block1' );

		// Assert
		$this->assertArrayNotHasKey( 'decorative', (array) $node['settings'] );
	}

	private function make_atomic_widget( string $id, string $widget_type, array $settings, string $el_type = 'widget' ): array {
		$element = [
			'id' => $id,
			'elType' => $el_type,
			'settings' => $settings,
			'styles' => [],
			'elements' => [],
		];

		if ( 'widget' === $el_type ) {
			$element['widgetType'] = $widget_type;
		}

		return $element;
	}

	private function read_node_with_content( int $post_id, string $element_id ): array {
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'element_id' => $element_id,
			'include_content' => true,
		] );

		$this->assertIsArray( $result );

		return $result['elements'][0];
	}

	private function given_dynamic_tags( array $tags ): void {
		$module = Dynamic_Tags_Module::instance();

		$reflection = new \ReflectionClass( $module->registry );
		$tags_prop = $reflection->getProperty( 'tags' );
		$tags_prop->setAccessible( true );
		$tags_prop->setValue( $module->registry, $tags );
	}

	private function mock_document_with_elements( int $post_id, array $elements ): void {
		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_built_with_elementor' )->willReturn( true );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_elements_data' )->willReturn( $elements );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;
	}
}
