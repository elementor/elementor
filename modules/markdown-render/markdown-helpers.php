<?php
namespace Elementor\Modules\MarkdownRender;

use Elementor\Core\Base\Providers\Social_Network_Provider;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Helpers {

	public static function plain_text( $value ): string {
		return Utils::html_to_plain_text( (string) $value );
	}

	public static function link( string $text, string $url ): string {
		return '[' . $text . '](' . esc_url( $url ) . ')';
	}

	public static function button( string $text, string $url = '' ): string {
		if ( '' === trim( $text ) ) {
			return '';
		}

		if ( '' !== $url ) {
			return '[**' . $text . '**](' . esc_url( $url ) . ')';
		}

		return '**' . $text . '**';
	}

	public static function join_blocks( array $blocks ): string {
		$parts = array_filter( array_map( 'trim', $blocks ), static function ( $block ) {
			return '' !== $block;
		} );

		return implode( "\n\n", $parts );
	}

	public static function bullet_list( array $lines ): string {
		$items = array_filter( $lines, static function ( $line ) {
			return '' !== trim( (string) $line );
		} );

		return implode( "\n", $items );
	}

	public static function widget_section( string $title, string $content ): string {
		$content = trim( $content );

		if ( '' === $content ) {
			return '';
		}

		$title = trim( $title );

		if ( '' === $title ) {
			return $content;
		}

		return '## ' . $title . "\n\n" . $content;
	}

	public static function format_contact_link( string $platform, array $data, string $prefix ): string {
		switch ( $platform ) {
			case Social_Network_Provider::EMAIL:
				return Social_Network_Provider::build_email_link( $data, $prefix );
			case Social_Network_Provider::SMS:
				$number = $data[ $prefix . '_number' ] ?? $data['number'] ?? '';

				return '' !== $number ? 'sms:' . $number : '';
			case Social_Network_Provider::WHATSAPP:
				$number = $data[ $prefix . '_number' ] ?? $data['number'] ?? '';

				return '' !== $number ? 'https://wa.me/' . $number : '';
			case Social_Network_Provider::TELEPHONE:
				$number = $data[ $prefix . '_number' ] ?? $data['number'] ?? '';

				return '' !== $number ? 'tel:' . $number : '';
			case Social_Network_Provider::MESSENGER:
				$username = $data[ $prefix . '_username' ] ?? $data['username'] ?? '';

				return '' !== $username ? Social_Network_Provider::build_messenger_link( $username ) : '';
			case Social_Network_Provider::VIBER:
				$number = $data[ $prefix . '_number' ] ?? $data['number'] ?? '';
				$action = $data[ $prefix . '_viber_action' ] ?? $data['viber_action'] ?? 'chat';

				return Social_Network_Provider::build_viber_link( $action, $number );
			case Social_Network_Provider::SKYPE:
				$username = $data[ $prefix . '_username' ] ?? $data['username'] ?? '';

				return '' !== $username ? 'skype:' . $username . '?chat' : '';
			case Social_Network_Provider::WAZE:
				$location = $data[ $prefix . '_waze' ] ?? $data[ $prefix . '_location' ] ?? $data['location'] ?? [];

				return is_array( $location ) ? ( $location['url'] ?? '' ) : (string) $location;
			case Social_Network_Provider::URL:
				$url = $data[ $prefix . '_url' ] ?? $data['url'] ?? [];

				return is_array( $url ) ? ( $url['url'] ?? '' ) : (string) $url;
			case Social_Network_Provider::FILE_DOWNLOAD:
			case Social_Network_Provider::VCF:
				$file = $data[ $prefix . '_file' ] ?? $data['file'] ?? [];

				return is_array( $file ) ? ( $file['url'] ?? '' ) : (string) $file;
			default:
				$url = $data[ $prefix . '_url' ] ?? $data['url'] ?? [];

				return is_array( $url ) ? ( $url['url'] ?? '' ) : (string) $url;
		}
	}

	public static function contact_line( string $label, string $platform, string $link, string $value = '' ): string {
		$platform_mapping = Social_Network_Provider::get_text_mapping( $platform );
		$platform_name = $platform_mapping ? $platform_mapping : $platform;
		$display = '' !== $value ? $value : $platform_name;

		if ( '' !== $link ) {
			return '- **' . $label . ':** [' . $display . '](' . esc_url( $link ) . ')';
		}

		if ( '' !== $display ) {
			return '- **' . $label . ':** ' . $display;
		}

		return '';
	}
}
