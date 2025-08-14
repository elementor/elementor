<?php
namespace Elementor\Modules\Components\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;


use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Plugin;
use Elementor\Utils;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Component extends Atomic_Widget_Base
{
	public static function get_element_type(): string
	{
		return 'e-component';
	}

	public function get_title()
	{
		$title = esc_html__('Component', 'elementor');


		if (isset($this->get_settings) && null !== $this->get_settings('component_id')) {
			$post_id = $this->get_settings('component_id')['value'];
			$title = Plugin::$instance->documents->get($post_id)->get_title();
		}

		return $title;
	}

	public function get_keywords()
	{
		return ['component'];
	}

	public function get_icon()
	{
		return 'eicon-star';
	}

	protected static function define_props_schema(): array
	{
		$props = [
			'component_id' => Number_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array
	{
		return [];
	}

	protected function get_settings_controls(): array
	{
		return [];
	}

	protected function render()
	{
		if ( null === $this->get_settings( 'component_id' ) ) {
			return;
		}

		$post_id = $this->get_settings('component_id')['value'];

		echo '<div class="e-component">';
		echo Plugin::$instance->frontend->get_builder_content($post_id);
		echo '</div>';
	}

}