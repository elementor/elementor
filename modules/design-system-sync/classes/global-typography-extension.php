<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Controls_Manager;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;
use Elementor\Modules\DesignSystemSync\Controls\V4_Typography_List;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Typography_Extension {
	public function register_hooks() {
		add_action( 'elementor/kit/global-typography/register_controls', [ $this, 'add_v4_classes_section' ] );
	}

	public function add_v4_classes_section( Global_Typography $tab ) {
		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			return;
		}

		$v4_typography_classes = Classes_Provider::get_typography_classes();

		if ( empty( $v4_typography_classes ) ) {
			return;
		}

		$tab->add_control(
			'heading_v4_typography_classes',
			[
				'type' => Controls_Manager::HEADING,
				'label' => esc_html__( 'Version 4 Classes', 'elementor' ),
				'separator' => 'before',
			]
		);

		$tab->add_control(
			'heading_v4_typography_classes_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => esc_html__( 'V4 classes can only be edited when applied on an atom.', 'elementor' ),
				'content_classes' => 'elementor-descriptor',
			]
		);

		$items = [];

		foreach ( $v4_typography_classes as $class ) {
			$label = sanitize_text_field( $class['label'] ?? '' );

			if ( empty( $label ) ) {
				continue;
			}

			$items[] = [ 'title' => $label ];
		}

		$tab->add_control(
			'v4_typography_classes_display',
			[
				'type' => V4_Typography_List::TYPE,
				'items' => $items,
			]
		);
	}
}
