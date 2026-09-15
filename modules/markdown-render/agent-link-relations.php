<?php
namespace Elementor\Modules\MarkdownRender;

use Elementor\Modules\Agents\Module as Agents_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Agent_Link_Relations {

	private string $alternate_url;

	private ?string $describedby_url;

	public function __construct( string $alternate_url, ?string $describedby_url ) {
		$this->alternate_url = $alternate_url;
		$this->describedby_url = $describedby_url;
	}

	public static function for_post( int $post_id ): ?self {
		$alternate_url = Markdown_Url::get_url_for_post( $post_id );

		if ( '' === $alternate_url ) {
			return null;
		}

		$describedby_url = self::get_describedby_url_for_post( $post_id );

		return new self( $alternate_url, $describedby_url );
	}

	public function has_alternate(): bool {
		return '' !== $this->alternate_url;
	}

	public function has_describedby(): bool {
		return null !== $this->describedby_url && '' !== $this->describedby_url;
	}

	public function is_empty(): bool {
		return ! $this->has_alternate() && ! $this->has_describedby();
	}

	public function print_html_link_tags(): void {
		if ( $this->has_alternate() ) {
			printf(
				'<link rel="alternate" type="text/markdown" href="%s" />' . "\n",
				esc_url( $this->alternate_url )
			);
		}

		if ( $this->has_describedby() ) {
			printf(
				'<link rel="describedby" href="%s" />' . "\n",
				esc_url( $this->describedby_url )
			);
		}
	}

	public function get_link_header_value(): string {
		$parts = [];

		if ( $this->has_alternate() ) {
			$parts[] = $this->format_link_header_part(
				$this->alternate_url,
				'alternate',
				'text/markdown'
			);
		}

		if ( $this->has_describedby() ) {
			$parts[] = $this->format_link_header_part(
				$this->describedby_url,
				'describedby'
			);
		}

		return implode( ', ', $parts );
	}

	public function get_markdown_response_link_header_value(): string {
		if ( ! $this->has_describedby() ) {
			return '';
		}

		return $this->format_link_header_part( $this->describedby_url, 'describedby' );
	}

	private function format_link_header_part( string $url, string $rel, ?string $type = null ): string {
		$relative = wp_make_link_relative( $url );

		if ( '' === $relative ) {
			$relative = $url;
		}

		$header = '<' . $relative . '>; rel="' . $rel . '"';

		if ( $type ) {
			$header .= '; type="' . $type . '"';
		}

		return $header;
	}

	private static function get_describedby_url_for_post( int $post_id ): ?string {
		if ( ! Plugin::$instance->experiments->is_feature_active( Agents_Module::EXPERIMENT_NAME ) ) {
			return null;
		}

		$llms_url = self::get_llms_txt_url_for_path( get_permalink( $post_id ) );

		if ( null === $llms_url || ! self::has_llms_txt_content() ) {
			return null;
		}

		return $llms_url;
	}

	private static function get_llms_txt_url_for_path( $url ): ?string {
		if ( ! is_string( $url ) || '' === $url ) {
			return home_url( '/llms.txt' );
		}

		$path = wp_parse_url( $url, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return home_url( '/llms.txt' );
		}

		/**
		 * Filters the llms.txt URL used in agent link relations for a page.
		 *
		 * @param string $llms_url Resolved llms.txt URL.
		 * @param string $path     Requested page path.
		 */
		return apply_filters( 'elementor/markdown/llms_txt_url', home_url( '/llms.txt' ), $path );
	}

	private static function has_llms_txt_content(): bool {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$agents = $kit->get_settings( 'agents' );

		if ( ! is_array( $agents ) || ! isset( $agents['llms'] ) ) {
			return false;
		}

		return is_string( $agents['llms'] ) && '' !== $agents['llms'];
	}
}
