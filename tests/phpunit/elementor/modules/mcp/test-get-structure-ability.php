<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\Mcp\Abilities\Get_Structure_Ability;
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
					'elements' => [
						[
							'id' => 'widget1',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
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
				[ 'id' => 'widget2', 'elType' => 'widget', 'widgetType' => 'e-button' ],
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
								'$$type' => 'html-v3',
								'value' => [
									'content' => [
										'$$type' => 'string',
										'value' => 'Hello',
									],
									'children' => [],
								],
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
		$this->assertSame( '#fff', $root['styles']['color'] );
		$this->assertSame( 'outline: none;', $root['styles']['__custom_css'] );

		$child = $root['elements'][0];
		$this->assertSame( 'widget1', $child['id'] );
		$this->assertSame(
			[ 'title' => [ 'content' => 'Hello', 'children' => [] ] ],
			$child['settings']
		);
		$this->assertSame( [], $child['styles'] );
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
		$this->assertSame( [], $node['styles'] );
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
		$this->assertSame( '#123456', $styles['color'] );
	}

	public function test_execute__attaches_other_variants_under_double_underscore_variants() {
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
						'variants' => [ $desktop_variant, $mobile_variant ],
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
		$this->assertSame( '#fff', $styles['color'] );
		$this->assertArrayNotHasKey( '__custom_css', $styles );
		$this->assertCount( 1, $styles['__variants'] );
		$this->assertSame( 'mobile', $styles['__variants'][0]['meta']['breakpoint'] );
		$this->assertSame( '#000', $styles['__variants'][0]['color'] );
	}
}
