<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Component;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Generic_Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

const MOCK_DOCUMENT_ID = '2300'; // This is a mock document ID for testing purposes.


/**
mock JSON:

[{"id":"e79b0a0","elType":"e-flexbox","settings":{"classes":{"$$type":"classes","value":["e-e79b0a0-eb47f57"]}},"elements":[{"id":"625add2","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-625add2-25a6281"]},"image":{"$$type":"image","value":{"size":{"$$type":"string","value":"medium"},"src":{"$$type":"image-src","value":{"id":{"$$type":"image-attachment-id","value":960},"url":null}}}}},"elements":[],"widgetType":"e-image","styles":{"e-625add2-25a6281":{"id":"e-625add2-25a6281","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"max-width":{"$$type":"size","value":{"size":35,"unit":"%"}}}}]}},"editor_settings":[],"version":"0.0"},{"id":"449d338","elType":"e-div-block","settings":{"classes":{"$$type":"classes","value":["e-449d338-87a1d34"]}},"elements":[{"id":"6b6048a","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-6b6048a-f3d3a6a"]}},"elements":[],"widgetType":"e-heading","styles":{"e-6b6048a-f3d3a6a":{"id":"e-6b6048a-f3d3a6a","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"900"},"font-size":{"$$type":"size","value":{"size":65,"unit":"px"}},"color":{"$$type":"color","value":"#5e6171"}}}]}},"editor_settings":[],"version":"0.0"},{"id":"3f16ed7","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-3f16ed7-ac02a8a"]},"tag":{"$$type":"string","value":"h4"}},"elements":[],"widgetType":"e-heading","styles":{"e-3f16ed7-ac02a8a":{"id":"e-3f16ed7-ac02a8a","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-size":{"$$type":"size","value":{"size":22,"unit":"px"}},"color":{"$$type":"color","value":"#6f7277"}}}]}},"editor_settings":[],"version":"0.0"},{"id":"472e342","elType":"e-flexbox","settings":{"classes":{"$$type":"classes","value":["e-472e342-8aba5de"]}},"elements":[{"id":"5dac8d2","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-5dac8d2-ad7ccc5"]}},"elements":[],"widgetType":"e-button","styles":{"e-5dac8d2-ad7ccc5":{"id":"e-5dac8d2-ad7ccc5","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"700"},"color":{"$$type":"color","value":"#ffffff"},"background":{"$$type":"background","value":{"color":{"$$type":"color","value":"#73c76f"}}}}}]}},"editor_settings":[],"version":"0.0"},{"id":"dc6e061","elType":"widget","settings":{"classes":{"$$type":"classes","value":["e-dc6e061-0c2e6af"]}},"elements":[],"widgetType":"e-button","styles":{"e-dc6e061-0c2e6af":{"id":"e-dc6e061-0c2e6af","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"font-weight":{"$$type":"string","value":"700"},"color":{"$$type":"color","value":"#ffffff"},"background":{"$$type":"background","value":{"color":{"$$type":"color","value":"#79290f"}}}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-472e342-8aba5de":{"id":"e-472e342-8aba5de","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"justify-content":{"$$type":"string","value":"space-between"}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-449d338-87a1d34":{"id":"e-449d338-87a1d34","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"width":{"$$type":"size","value":{"size":60,"unit":"%"}},"height":{"$$type":"size","value":{"size":100,"unit":"%"}},"display":{"$$type":"string","value":"flex"},"flex-direction":{"$$type":"string","value":"column"},"flex":{"$$type":"flex","value":{"flexGrow":null,"flexShrink":null,"flexBasis":null}},"justify-content":{"$$type":"string","value":"space-evenly"},"align-items":{"$$type":"string","value":"start"},"align-self":{"$$type":"string","value":"stretch"}}}]}},"editor_settings":[],"version":"0.0"}],"isInner":false,"styles":{"e-e79b0a0-eb47f57":{"id":"e-e79b0a0-eb47f57","label":"local","type":"class","variants":[{"meta":{"breakpoint":"desktop","state":null},"props":{"flex-direction":{"$$type":"string","value":"row"},"align-items":{"$$type":"string","value":"stretch"}}}]}},"editor_settings":[],"version":"0.0"}]

should be inserted into the document with the ID 2300 (or another ID and change the MOCK_DOCUMENT_ID value responsively.
 */

class Component extends Atomic_Widget_Base {
    // use Has_Template;

    private $elements_data;

    public function __construct( $data = [], $args = null, $post_id = MOCK_DOCUMENT_ID ) {
        parent::__construct( $data, $args );

        $document = Plugin::$instance->documents->get_doc_for_frontend( $post_id );
        $elements_data = $document->get_elements_data();

        $this->elements_data = $elements_data;
        Plugin::$instance->frontend->get_builder_content_for_display( $post_id );
    }

    public function get_initial_config() {
        $config = parent::get_initial_config();

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
        return [
            'post_id' => String_Prop_Type::make()
                ->default( MOCK_DOCUMENT_ID ),
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
    }

    protected function define_atomic_controls(): array {
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
        $this->render_component_with_overrides( MOCK_DOCUMENT_ID );
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


        $image_id = "625add2";
        $title_id = "6b6048a";
        $name_id = "3f16ed7";
        $button1_id = "5dac8d2";
        $button2_id = "dc6e061";

        $overrides = [];

        if ( $profile_image && $profile_image_url !== Placeholder_Image::get_placeholder_image() ) {
            $overrides[$image_id] = ['image' => $profile_image];
        }

        if ( $title ) {
            $overrides[$title_id] = ['title' => $title];
        }

        if ( $name ) {
            $overrides[$name_id] = ['title' => $name];
        }

        if ( $button_text_1 ) {
            $overrides[$button1_id] = ['text' => $button_text_1];
        }

        if ( $button_text_2 ) {
            $overrides[$button2_id] = ['text' => $button_text_2];
        }

        $document = Plugin::$instance->documents->get_current();

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

    public function get_data_for_save() {
        $data = parent::get_data_for_save();

        if( ! isset( $data['settings']['post_id'] ) ) {
            $data['settings']['post_id'] = [
                '$$type' => 'string',
                'value' => MOCK_DOCUMENT_ID
            ];
        }

        return $data;
    }
}
