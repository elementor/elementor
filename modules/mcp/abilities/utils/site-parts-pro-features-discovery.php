<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Parts_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-site-parts/';

	const WIDGET_TYPE_PREFIX = 'theme-';

	const GROUP_REUSABLE_PART = 'reusable-part';
	const GROUP_DYNAMIC_TEMPLATE = 'dynamic-template';
	const GROUP_POPUP = 'popup';
	const GROUP_ERROR_404 = 'error-404';

	const TYPE_GROUPS = [
		'header' => self::GROUP_REUSABLE_PART,
		'footer' => self::GROUP_REUSABLE_PART,
		'single' => self::GROUP_DYNAMIC_TEMPLATE,
		'single-post' => self::GROUP_DYNAMIC_TEMPLATE,
		'single-page' => self::GROUP_DYNAMIC_TEMPLATE,
		'archive' => self::GROUP_DYNAMIC_TEMPLATE,
		'search-results' => self::GROUP_DYNAMIC_TEMPLATE,
		'loop-item' => self::GROUP_DYNAMIC_TEMPLATE,
		'popup' => self::GROUP_POPUP,
		'error-404' => self::GROUP_ERROR_404,
	];

	public static function supports_widget( string $widget_type ): bool {
		return ! Utils::has_pro() && str_starts_with( $widget_type, self::WIDGET_TYPE_PREFIX );
	}

	public static function for_manage( array $operations ): \WP_Error {
		$copies = [];

		foreach ( self::group_requested_types( $operations ) as $group => $types ) {
			$copies[] = self::get_group_copy( $group, wp_sprintf( '%l', $types ) );
		}

		return self::error(
			__( 'Site parts need Elementor Pro, which isn\'t installed, so nothing was created.', 'elementor' ),
			$copies ? $copies : [ self::get_overview_copy() ]
		);
	}

	public static function for_widget(): \WP_Error {
		return self::for_manage( [] );
	}

	public static function for_list(): array {
		return [
			'llm_instructions' => __( 'Site parts can\'t be listed because Elementor Pro isn\'t installed, so no site parts were checked. Do not tell the user the site has no header, footer, or other site parts; that was not verified. Mention Elementor Pro only if the user\'s request is about a site part.', 'elementor' ),
		];
	}

	private static function error( string $opener, array $copies ): \WP_Error {
		return Pro_Features_Discovery::error(
			implode( ' ', array_merge( [ $opener ], array_column( $copies, 'value' ) ) ),
			implode( ' ', array_column( $copies, 'free_path' ) ),
			self::UPGRADE_URL
		);
	}

	/**
	 * @return array<string, string[]> Requested types keyed by group, in request order.
	 */
	private static function group_requested_types( array $operations ): array {
		$types_by_group = [];

		foreach ( array_unique( array_column( $operations, 'type' ) ) as $type ) {
			if ( is_string( $type ) && isset( self::TYPE_GROUPS[ $type ] ) ) {
				$types_by_group[ self::TYPE_GROUPS[ $type ] ][] = $type;
			}
		}

		return $types_by_group;
	}

	/**
	 * @return array{value: string, free_path: string}
	 */
	private static function get_overview_copy(): array {
		return [
			'value' => __( 'With Pro, site parts cover three things Free can\'t do: reusable parts (header, footer) built once and shown on every page; dynamic templates (post, page, archive, search results, loop item, product) where one design fills itself for every post; and site functionality (popups, a custom 404 page).', 'elementor' ),
			'free_path' => self::get_group_copy( self::GROUP_REUSABLE_PART, '' )['free_path'],
		];
	}

	/**
	 * @return array{value: string, free_path: string}
	 */
	private static function get_group_copy( string $group, string $types_label ): array {
		switch ( $group ) {
			case self::GROUP_DYNAMIC_TEMPLATE:
				return [
					'value' => sprintf(
						/* translators: %s: site part type(s), e.g. "single-post". */
						__( 'What Pro gives the user: one %s design that fills itself with each post\'s own content, so every new post matches automatically.', 'elementor' ),
						$types_label
					),
					'free_path' => __( 'Free path: style posts one by one in the editor. Tell the user each new post needs the same work.', 'elementor' ),
				];

			case self::GROUP_POPUP:
				return [
					'value' => __( 'What Pro gives the user: a popup that opens on the trigger they want, like a click or exit intent, on the pages they choose.', 'elementor' ),
					'free_path' => __( 'Free path: none that matches. Offer a section on the page or a link to a separate page. Say plainly that Free can\'t do this.', 'elementor' ),
				];

			case self::GROUP_ERROR_404:
				return [
					'value' => __( 'What Pro gives the user: a custom 404 page in the site\'s design instead of the theme\'s default.', 'elementor' ),
					'free_path' => __( 'Free path: none. The theme\'s default 404 page stays. Say plainly that Free can\'t do this.', 'elementor' ),
				];

			default:
				return [
					'value' => sprintf(
						/* translators: %s: site part type(s), e.g. "header and footer". */
						__( 'What Pro gives the user: this %s is built once and appears on every page it\'s assigned to. Edits happen in one place.', 'elementor' ),
						$types_label
					),
					'free_path' => __( 'Free path: build it on the current page with native widgets and a global class. Tell the user it only appears on this page and must be added and updated on each page separately.', 'elementor' ),
				];
		}
	}
}
