<?php

namespace Elementor\Core\Elements\Concerns;

use Elementor\Core\Elements\Atomic_Element;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\TemplateRenderer\Template_Renderer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Atomic_Element
 */
trait Has_Settings_Controls {
	public function get_atomic_settings_controls() {
		$controls = apply_filters(
			'elementor/atomic-widgets/controls',
			$this->define_atomic_settings_controls(),
			$this
		);

		$schema = $this->get_atomic_settings_schema();

		// Validate the schema only in the Editor.
		$this->validate_schema( $schema );

		return $this->get_valid_controls( $schema, $controls );
	}

	private function get_valid_controls( array $schema, array $controls ): array {
		$valid_controls = [];

		foreach ( $controls as $control ) {
			if ( $control instanceof Section ) {
				$cloned_section = clone $control;

				$cloned_section->set_items(
					$this->get_valid_controls( $schema, $control->get_items() )
				);

				$valid_controls[] = $cloned_section;
				continue;
			}

			if ( ! ( $control instanceof Atomic_Control_Base ) ) {
				Utils::safe_throw( 'Control must be an instance of `Atomic_Control_Base`.' );
				continue;
			}

			$prop_name = $control->get_bind();

			if ( ! $prop_name ) {
				Utils::safe_throw( 'Control is missing a bound prop from the schema.' );
				continue;
			}

			if ( ! array_key_exists( $prop_name, $schema ) ) {
				Utils::safe_throw( "Prop `{$prop_name}` is not defined in the schema of `{$this->get_name()}`." );
				continue;
			}

			$valid_controls[] = $control;
		}

		return $valid_controls;
	}

	/**
	 * @return array<string, Section | Atomic_Control_Base>
	 */
	abstract protected function define_atomic_settings_controls(): array;
}
