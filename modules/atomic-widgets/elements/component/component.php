<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Component;

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
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;


use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component extends Atomic_Widget_Base {
	// use Has_Template;

	private $elements_data;

	const LINK_BASE_STYLE_KEY = 'link-base';

	public function __construct( $data = [], $args = null, $post_id = "307" ) {
		parent::__construct( $data, $args );

		$document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );
		$elements_data = $document->get_elements_data();

		$this->elements_data = $elements_data;
		Plugin::$instance->frontend->get_builder_content_for_display( $post_id ); 
	}

	public function get_initial_config() {
		$config = parent::get_initial_config();

		$config['elements_data'] = $this->elements_data[0]['elements'][0]['elements'];

		// $config['elements_data'] = $this->elements_data[0]['elements'];
		$config['elements_data'] = $this->elements_data;

		return $config;
	}

	public static function get_element_type(): string {
		return 'e-component';
	}

	public function get_title() {
		return esc_html__( 'Profile Card Component', 'elementor' );
	}

	public function get_keywords() {
		return [ 'component' ];
	}

	public function get_icon() {
		return 'eicon-user-circle-o';
	}

	protected static function define_props_schema(): array {
		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'profile-image' => Image_Prop_Type::make()
                ->default_url( Placeholder_Image::get_placeholder_image() )
                ->default_size( 'full' ),
            'name' => String_Prop_Type::make(),
            'title' => String_Prop_Type::make(),
            'button-text-1' => String_Prop_Type::make(),
            'button-text-2' => String_Prop_Type::make(),
		];

		return $props;
	}

    protected function define_atomic_controls(): array
    {
        return [
            Section::make()
                ->set_label( esc_html__( 'Content', 'elementor' ) )
                ->set_items( [
                    Image_Control::bind_to( 'profile-image' )
                    ->set_label( __( 'Profile Image', 'elementor' ) )
                    ->set_show_mode( 'media' ),
                    Text_Control::bind_to( 'name' )
                    ->set_label( __( 'Name', 'elementor' ) ),
                    Text_Control::bind_to( 'title' )
                    ->set_label( __( 'Title', 'elementor' ) ),
                ] ),
        ];
    }

	protected function get_settings_controls(): array {
		return [];
	}

	protected function render() {
        echo '<div class="e-component">';
		$this->render_component_with_overrides( '307' );
        echo '</div>';
    }

	private function render_component_with_overrides( $document_id ) {
		$settings = $this->get_settings() ?? [];
		
		$profile_image = $settings['profile-image'] ?? null;
        $profile_image_url = $profile_image['value']['src']['url'] ?? null;

		$name = $settings['name'] ?? '';
		$title = $settings['title'] ?? '';
		$button_text_1 = $settings['button-text-1'] ?? '';
		$button_text_2 = $settings['button-text-2'] ?? '';


        $image_id = "414a53c";
		$test_heading_id = "83b7d1b";
        $name_id = "87d3ef6";
        $title_id = "c8cb872";
        $button1_id = "1dd6d5c";
        $button2_id = "584127e";

        $overrides = [];

        if ( $profile_image && $profile_image_url !== Placeholder_Image::get_placeholder_image() ) {
            $overrides[$image_id] = ['image' => $profile_image];
        }

        if ( $name ) {
            $overrides[$name_id] = ['title' => $name];
			$overrides[$test_heading_id] = ['title' => $name];
        }

        if ( $title ) {
            $overrides[$title_id] = ['title' => $title];
        }

        if ( $button_text_1 ) {
            $overrides[$button1_id] = ['text' => $button_text_1];
        }

        if ( $button_text_2 ) {
            $overrides[$button2_id] = ['text' => $button_text_2];
        }
		
		if ( ! empty( $overrides ) ) {
			// Add temporary filter for overrides
			add_filter( 'elementor/atomic-widgets/get_overrides', function() use ( $overrides ) {
				return $overrides;
			}, 10, 0 );
			
			// Render with overrides
			echo Plugin::$instance->frontend->get_builder_content_for_display( $document_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			
			// Clean the filter
			remove_all_filters( 'elementor/atomic-widgets/get_overrides' );
		} else {
			// Render without overrides
			echo Plugin::$instance->frontend->get_builder_content_for_display( $document_id ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
	}
}
