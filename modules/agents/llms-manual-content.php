<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The llms.txt content an admin edited by hand.
 *
 * Stored in a dedicated, non-autoloaded option rather than a transient:
 * unlike generated content it cannot be rebuilt, and transients may be
 * evicted by a persistent object cache or wiped by cleanup tools.
 */
class Llms_Manual_Content {

	const OPTION = 'elementor_agent_ready_llms_txt_content';

	private Content_Generator $generator;

	public function __construct( Content_Generator $generator ) {
		$this->generator = $generator;
	}

	public function get_content(): string {
		$content = $this->get_stored()['content'] ?? '';

		return is_string( $content ) ? $content : '';
	}

	public function get_modified_at(): int {
		return (int) ( $this->get_stored()['modified_at'] ?? 0 );
	}

	/**
	 * @throws \InvalidArgumentException When the content is empty or exceeds the size cap.
	 */
	public function save( string $content ): void {
		$clean = $this->generator->prepare_override_text( $content );

		if ( '' === trim( $clean ) ) {
			throw new \InvalidArgumentException( esc_html__( 'The llms.txt content cannot be empty.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( strlen( $clean ) > Content_Generator::LLMS_FULL_HARD_CAP ) {
			throw new \InvalidArgumentException( esc_html__( 'The llms.txt content is too large.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		update_option( self::OPTION, [
			'content'     => $clean,
			'modified_at' => time(),
		], false );
	}

	private function get_stored(): array {
		$stored = get_option( self::OPTION, [] );

		return is_array( $stored ) ? $stored : [];
	}
}
