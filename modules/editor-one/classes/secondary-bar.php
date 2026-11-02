<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Secondary_Bar {

	const ADDONS_PARENTS = [
		Admin_Flow_Config::PARENT_SETTINGS,
		Admin_Flow_Config::PARENT_TOOLS,
	];

	public function get_bar( Admin_Flow_Map $map, Menu_Data_Provider $provider, array $state ): array {
		$group_id = $state['group'] ?? '';
		$tabs = '' === $group_id ? [] : $this->prepare_tabs( $map->get_tabs( $group_id ), $state['tab'] ?? '' );

		if ( empty( $tabs ) ) {
			return [];
		}

		$parent = $state['parent'] ?? '';

		return [
			'label' => $this->get_section_label( $parent ),
			'tabs' => $tabs,
			'addons' => $this->should_show_addons( $parent ) ? $this->get_addons( $provider ) : [],
		];
	}

	public function render( array $bar ): void {
		if ( empty( $bar['tabs'] ) ) {
			return;
		}

		$aria_label = sprintf(
			/* translators: %s: admin section name. */
			esc_html__( '%s section', 'elementor' ),
			$bar['label']
		);

		echo '<nav class="e-admin-secondary-bar" aria-label="' . esc_attr( $aria_label ) . '">';
		echo '<ul class="e-admin-secondary-bar__tabs">';

		foreach ( $bar['tabs'] as $tab ) {
			$classes = 'e-admin-secondary-bar__tab';

			if ( ! empty( $tab['is_active'] ) ) {
				$classes .= ' is-active';
			}

			echo '<li class="e-admin-secondary-bar__tab-item">';
			echo '<a class="' . esc_attr( $classes ) . '" href="' . esc_url( $tab['url'] ) . '"';

			if ( ! empty( $tab['is_active'] ) ) {
				echo ' aria-current="page"';
			}

			echo '>' . esc_html( $tab['label'] ) . '</a>';
			echo '</li>';
		}

		echo '</ul>';

		if ( ! empty( $bar['addons'] ) ) {
			echo '<details class="e-admin-secondary-bar__addons">';
			echo '<summary class="e-admin-secondary-bar__addons-toggle">' . esc_html__( 'Addons', 'elementor' ) . '</summary>';
			echo '<ul class="e-admin-secondary-bar__addons-menu">';

			foreach ( $bar['addons'] as $addon ) {
				echo '<li class="e-admin-secondary-bar__addons-item">';
				echo '<a class="e-admin-secondary-bar__addons-link" href="' . esc_url( $addon['url'] ) . '">' . esc_html( $addon['label'] ) . '</a>';
				echo '</li>';
			}

			echo '</ul>';
			echo '</details>';
		}

		echo '<button type="button" class="e-admin-secondary-bar__finder" aria-label="' . esc_attr__( 'Finder', 'elementor' ) . '">';
		echo '<i class="eicon-search" aria-hidden="true"></i>';
		echo '</button>';
		echo '</nav>';
	}

	public function get_addons( Menu_Data_Provider $provider ): array {
		$addons = [];

		foreach ( $provider->get_level4_flyout_data()[ Menu_Config::THIRD_PARTY_GROUP_ID ]['items'] ?? [] as $item ) {
			$label = $this->plain_label( $item['label'] );

			if ( '' !== $label ) {
				$addons[] = [
					'label' => $label,
					'url' => $item['url'],
				];
			}
		}

		return $addons;
	}

	private function prepare_tabs( array $tabs, string $active_tab_id ): array {
		$prepared = [];

		foreach ( $tabs as $tab_id => $tab ) {
			$label = $this->plain_label( $tab['label'] ?? '' );

			if ( '' === $label || empty( $tab['url'] ) ) {
				continue;
			}

			$prepared[] = [
				'id' => $tab_id,
				'label' => $label,
				'url' => $tab['url'],
				'is_active' => $tab_id === $active_tab_id,
			];
		}

		return $prepared;
	}

	private function should_show_addons( string $parent_slug ): bool {
		return in_array( $parent_slug, self::ADDONS_PARENTS, true );
	}

	private function get_section_label( string $parent_slug ): string {
		$label = Admin_Flow_Config::get_config()['parents'][ $parent_slug ]['label'] ?? '';

		if ( '' === $label ) {
			return esc_html__( 'Elementor', 'elementor' );
		}

		return $this->plain_label( $label );
	}

	private function plain_label( string $label ): string {
		return trim( wp_strip_all_tags( html_entity_decode( $label, ENT_QUOTES, 'UTF-8' ) ) );
	}
}
