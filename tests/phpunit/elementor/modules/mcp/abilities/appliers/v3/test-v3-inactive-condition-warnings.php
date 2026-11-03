<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Condition;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Inactive_Condition_Warnings;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Inactive_Condition_Warnings extends TestCase {

	private function controls(): array {
		return [
			'layout' => [
				'type' => 'select',
				'default' => 'horizontal',
			],
			'dropdown' => [
				'type' => 'select',
				'default' => 'tablet',
			],
			'pointer' => [
				'type' => 'select',
				'condition' => [ 'layout!' => 'dropdown' ],
			],
			'menu_name' => [ 'type' => 'text' ],
		];
	}

	private function layout_visibility(): callable {
		return function ( array $control, array $values ): bool {
			$expected = $control['condition']['layout!'] ?? null;

			return null === $expected || $expected !== ( $values['layout'] ?? null );
		};
	}

	public function test_describe__words_negated_and_one_of_terms() {
		// Arrange.
		$condition = [
			'layout!' => 'dropdown',
			'pointer' => [ 'underline', 'overline' ],
			'link[url]!' => '',
		];

		// Act.
		$description = V3_Control_Condition::describe( $condition );

		// Assert.
		$this->assertSame(
			"layout is not 'dropdown' and pointer is one of 'underline', 'overline' and link.url is not ''",
			$description
		);
	}

	public function test_describe__uses_schema_values_for_switchers_empty_options_and_multiple_controls() {
		// Arrange.
		$condition = [
			'show_labels' => 'yes',
			'gallery_display_caption' => '',
			'expire_actions' => 'message',
		];
		$controls = [
			'show_labels' => [
				'type' => 'switcher',
			],
			'gallery_display_caption' => [
				'type' => 'select',
				'options' => [
					'none' => 'None',
					'' => 'Attachment Caption',
				],
			],
			'expire_actions' => [
				'type' => 'select2',
				'multiple' => true,
				'options' => [
					'message' => 'Show Message',
				],
			],
		];

		// Act.
		$description = V3_Control_Condition::describe( $condition, $controls );

		// Assert.
		$this->assertSame(
			"show_labels is true and gallery_display_caption is 'attachment-caption' and expire_actions includes 'message'",
			$description
		);
	}

	public function test_collect__warns_when_written_control_is_hidden_by_final_settings() {
		// Arrange.
		$settings = [
			'layout' => 'dropdown',
			'pointer' => 'underline',
		];

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], $settings, $this->controls(), $this->layout_visibility() );

		// Assert.
		$this->assertSame(
			[ "Setting pointer was saved but only takes effect when layout is not 'dropdown'." ],
			$messages
		);
	}

	public function test_collect__stays_silent_when_condition_holds() {
		// Arrange.
		$settings = [
			'layout' => 'vertical',
			'pointer' => 'underline',
		];

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], $settings, $this->controls(), $this->layout_visibility() );

		// Assert.
		$this->assertSame( [], $messages );
	}

	public function test_collect__fills_unset_settings_with_control_defaults() {
		// Arrange.
		$received_values = null;
		$is_visible = function ( array $control, array $values ) use ( &$received_values ): bool {
			$received_values = $values;

			return true;
		};

		// Act.
		V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], [ 'pointer' => 'underline' ], $this->controls(), $is_visible );

		// Assert.
		$this->assertSame( 'horizontal', $received_values['layout'] );
		$this->assertSame( 'tablet', $received_values['dropdown'] );
		$this->assertSame( 'underline', $received_values['pointer'] );
	}

	public function test_collect__groups_settings_hidden_by_the_same_condition() {
		// Arrange.
		$controls = array_merge( $this->controls(), [
			'pointer_color' => [
				'type' => 'color',
				'condition' => [ 'layout!' => 'dropdown' ],
			],
		] );

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer', 'pointer_color' ], [ 'layout' => 'dropdown' ], $controls, $this->layout_visibility() );

		// Assert.
		$this->assertSame(
			[ "Settings pointer, pointer_color were saved but only take effect when layout is not 'dropdown'." ],
			$messages
		);
	}

	public function test_collect__names_only_the_unmet_condition_terms() {
		// Arrange.
		$controls = array_merge( $this->controls(), [
			'font_size' => [
				'type' => 'slider',
				'condition' => [
					'layout!' => 'dropdown',
					'typography' => 'custom',
				],
			],
		] );
		$is_visible = function ( array $control, array $values ): bool {
			$condition = $control['condition'];
			$layout_holds = ! isset( $condition['layout!'] ) || 'dropdown' !== $values['layout'];
			$typography_holds = ! isset( $condition['typography'] ) || 'custom' === ( $values['typography'] ?? null );

			return $layout_holds && $typography_holds;
		};

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'font_size' ], [ 'layout' => 'dropdown', 'typography' => 'custom' ], $controls, $is_visible );

		// Assert.
		$this->assertSame(
			[ "Setting font_size was saved but only takes effect when layout is not 'dropdown'." ],
			$messages
		);
	}

	public function test_collect__labels_style_settings_by_their_css() {
		// Arrange.
		$labels = [ 'pointer' => 'border-color on wrapper:hover' ];

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'pointer' ], [ 'layout' => 'dropdown' ], $this->controls(), $this->layout_visibility(), $labels );

		// Assert.
		$this->assertSame(
			[ "Setting border-color on wrapper:hover was saved but only takes effect when layout is not 'dropdown'." ],
			$messages
		);
	}

	public function test_collect__ignores_written_keys_without_conditions_or_controls() {
		// Arrange.
		$never_visible = fn() => false;

		// Act.
		$messages = V3_Inactive_Condition_Warnings::collect( [ 'menu_name', 'unknown' ], [], $this->controls(), $never_visible );

		// Assert.
		$this->assertSame( [], $messages );
	}
}
