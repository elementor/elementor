<?php

namespace Elementor\Testing\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\ImportExport\Atomic_Import_Export;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Utils\Regenerate_Component_Element_Ids;
use Elementor\Testing\Modules\Components\Mocks\Nested_Components_Mocks;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Components
 */
class Test_Regenerate_Component_Element_Ids extends Elementor_Test_Base {
	const BUTTON_COMPONENT_ID = 1111;
	const CARD_COMPONENT_ID = 2222;
	const ACCORDION_COMPONENT_ID = 3333;
	const MISSING_COMPONENT_ID = 9999;

	public function set_up() {
		parent::set_up();

		remove_all_filters( 'elementor/document/element/replace_id' );
	}

	public function test_apply__regenerates_unique_ids_for_all_elements() {
		// Arrange
		$button = Nested_Components_Mocks::get_button_component_data();
		$old_ids = $this->collect_ids( $button['elements'] );

		// Act
		$result = Regenerate_Component_Element_Ids::apply( $this->build_post_data( $button ), [] );

		// Assert
		$new_ids = $this->collect_ids( $result['content'] );
		$this->assertCount( count( $old_ids ), $new_ids );
		$this->assertCount( count( $new_ids ), array_unique( $new_ids ) );
		$this->assertEmpty( array_intersect( $old_ids, $new_ids ) );
	}

	public function test_apply__local_style_ids_follow_new_element_id() {
		// Arrange
		( new Atomic_Import_Export() )->register_hooks();

		$post_data = [
			'content' => [
				[
					'id' => 'old-heading',
					'elType' => 'widget',
					'widgetType' => Atomic_Heading::get_element_type(),
					'styles' => [
						'e-old-heading-1' => [ 'id' => 'e-old-heading-1' ],
					],
					'settings' => [
						'classes' => Classes_Prop_Type::generate( [ 'e-old-heading-1' ] ),
					],
					'elements' => [],
				],
			],
		];

		// Act
		$result = Regenerate_Component_Element_Ids::apply( $post_data, [] );

		// Assert
		$heading = $result['content'][0];
		$style_ids = array_keys( $heading['styles'] );
		$this->assertNotSame( 'old-heading', $heading['id'] );
		$this->assertMatchesRegularExpression( '/^e-' . preg_quote( $heading['id'], '/' ) . '-[a-z0-9]{7}$/', $style_ids[0] );
		$this->assertSame( [ $style_ids[0] ], $heading['settings']['classes']['value'] );
	}

	public function test_apply__rewrites_own_element_id_and_keeps_unknown_ids() {
		// Arrange
		$button = Nested_Components_Mocks::get_button_component_data();
		$post_data = $this->build_post_data( $button );
		$post_data['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props']['prop-1']['elementId'] = 'unknown-id';

		// Act
		$result = Regenerate_Component_Element_Ids::apply( $post_data, [] );

		// Assert
		$props = $this->get_props( $result );
		$this->assertSame( $this->find_id_by_widget_type( $result['content'], 'e-button' ), $props['prop-0']['elementId'] );
		$this->assertSame( 'unknown-id', $props['prop-1']['elementId'] );
	}

	public function test_apply__two_level_chain_takes_nested_element_id() {
		// Arrange
		$button = Regenerate_Component_Element_Ids::apply( $this->build_post_data( Nested_Components_Mocks::get_button_component_data() ), [] );
		$imported_props = [ self::BUTTON_COMPONENT_ID => $this->get_props( $button ) ];

		// Act
		$card = Regenerate_Component_Element_Ids::apply( $this->build_card_post_data(), $imported_props );

		// Assert
		$props = $this->get_props( $card );
		$new_button_widget_id = $this->find_id_by_widget_type( $button['content'], 'e-button' );
		$this->assertSame( $new_button_widget_id, $props['prop-4']['originPropFields']['elementId'] );
		$this->assertSame( $new_button_widget_id, $props['prop-5']['originPropFields']['elementId'] );
		$this->assertSame( $this->find_id_by_widget_type( $card['content'], 'e-component' ), $props['prop-4']['elementId'] );
	}

	public function test_apply__three_level_chain_propagates_deepest_element_id() {
		// Arrange
		$button = Regenerate_Component_Element_Ids::apply( $this->build_post_data( Nested_Components_Mocks::get_button_component_data() ), [] );
		$imported_props = [ self::BUTTON_COMPONENT_ID => $this->get_props( $button ) ];
		$card = Regenerate_Component_Element_Ids::apply( $this->build_card_post_data(), $imported_props );
		$imported_props[ self::CARD_COMPONENT_ID ] = $this->get_props( $card );

		// Act
		$accordion = Regenerate_Component_Element_Ids::apply(
			$this->build_post_data( Nested_Components_Mocks::get_card_accordion_component_data() ),
			$imported_props
		);

		// Assert
		$props = $this->get_props( $accordion );
		$this->assertSame( $this->find_id_by_widget_type( $button['content'], 'e-button' ), $props['prop-10']['originPropFields']['elementId'] );
		$this->assertSame( $this->find_id_by_widget_type( $card['content'], 'e-heading' ), $props['prop-9']['originPropFields']['elementId'] );
		$this->assertSame( $this->find_id_by_widget_type( $card['content'], 'e-image' ), $props['prop-8']['originPropFields']['elementId'] );
	}

	public function test_apply__missing_nested_component_leaves_origin_prop_fields_unchanged() {
		// Arrange
		$post_data = $this->build_card_post_data( self::MISSING_COMPONENT_ID );

		// Act
		$result = Regenerate_Component_Element_Ids::apply( $post_data, [] );

		// Assert
		$this->assertSame( '07ac447', $this->get_props( $result )['prop-4']['originPropFields']['elementId'] );
	}

	private function build_post_data( array $mock ): array {
		return [
			'content' => $mock['elements'],
			'settings' => [],
			'metadata' => [
				Component_Document::OVERRIDABLE_PROPS_META_KEY => $mock['overridable_props'],
			],
		];
	}

	/**
	 * The card mock points its nested props at its own id, so it is pointed at the button component here.
	 */
	private function build_card_post_data( int $nested_component_id = self::BUTTON_COMPONENT_ID ): array {
		$post_data = $this->build_post_data( Nested_Components_Mocks::get_card_component_data() );

		foreach ( [ 'prop-4', 'prop-5' ] as $key ) {
			$post_data['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'][ $key ]['originValue']['value']['schema_source']['id'] = $nested_component_id;
		}

		return $post_data;
	}

	private function get_props( array $post_data ): array {
		return $post_data['metadata'][ Component_Document::OVERRIDABLE_PROPS_META_KEY ]['props'];
	}

	private function collect_ids( array $elements ): array {
		$ids = [];

		foreach ( $elements as $element ) {
			$ids[] = $element['id'];
			$ids = array_merge( $ids, $this->collect_ids( $element['elements'] ?? [] ) );
		}

		return $ids;
	}

	private function find_id_by_widget_type( array $elements, string $widget_type ): ?string {
		foreach ( $elements as $element ) {
			if ( ( $element['widgetType'] ?? null ) === $widget_type ) {
				return $element['id'];
			}

			$found = $this->find_id_by_widget_type( $element['elements'] ?? [], $widget_type );

			if ( $found ) {
				return $found;
			}
		}

		return null;
	}
}
