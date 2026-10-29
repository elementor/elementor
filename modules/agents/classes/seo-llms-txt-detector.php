<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Hints;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Seo_Llms_Txt_Detector {

	private static array $cache = [];

	public static function reset_cache(): void {
		self::$cache = [];
	}

	public function get_owner(): ?string {
		$blog_id = get_current_blog_id();

		if ( isset( self::$cache[ $blog_id ] ) ) {
			return self::$cache[ $blog_id ];
		}

		$owner = $this->detect_owner();

		$owner = apply_filters( 'elementor/agents/llms_txt/seo_plugin_owner', $owner );

		self::$cache[ $blog_id ] = $owner;

		return $owner;
	}

	public function get_owner_label(): string {
		$owner = $this->get_owner();

		$labels = [
			'yoast'      => 'Yoast SEO',
			'rank_math'  => 'Rank Math',
			'aioseo'     => 'All in One SEO',
		];

		return $labels[ $owner ] ?? '';
	}

	private function detect_owner(): ?string {
		if ( $this->is_yoast_llms_enabled() ) {
			return 'yoast';
		}

		if ( $this->is_rank_math_llms_enabled() ) {
			return 'rank_math';
		}

		if ( $this->is_aioseo_llms_enabled() ) {
			return 'aioseo';
		}

		return null;
	}

	private function is_yoast_active(): bool {
		if ( defined( 'WPSEO_VERSION' ) ) {
			return true;
		}

		return Hints::is_plugin_active( 'wordpress-seo' );
	}

	private function is_yoast_llms_enabled(): bool {
		if ( ! $this->is_yoast_active() || ! class_exists( 'WPSEO_Options' ) ) {
			return false;
		}

		$option = \WPSEO_Options::get( 'enable_llms_txt' );

		return (bool) $option;
	}

	private function is_rank_math_active(): bool {
		if ( defined( 'RANK_MATH_VERSION' ) || class_exists( 'RankMath' ) ) {
			return true;
		}

		return Hints::is_plugin_active( 'seo-by-rank-math' );
	}

	private function is_rank_math_llms_enabled(): bool {
		if ( ! $this->is_rank_math_active() ) {
			return false;
		}

		$modules = get_option( 'rank_math_modules', [] );

		if ( ! is_array( $modules ) ) {
			return false;
		}

		return in_array( 'llms-txt', $modules, true );
	}

	private function is_aioseo_active(): bool {
		if ( defined( 'AIOSEO_FILE' ) || function_exists( 'aioseo' ) ) {
			return true;
		}

		return Hints::is_plugin_active( 'all-in-one-seo-pack' );
	}

	private function is_aioseo_llms_enabled(): bool {
		if ( ! $this->is_aioseo_active() ) {
			return false;
		}

		$option = get_option( 'aioseo_options', '' );

		if ( is_string( $option ) && '' !== $option ) {
			$option = json_decode( $option, true );
		}

		if ( ! is_array( $option ) ) {
			return false;
		}

		return ! empty( $option['sitemap']['llms']['enable'] );
	}
}
