<?php

namespace Elementor\Modules\Interactions;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Adapter {
    const VERSION_V1 = 1;
    const VERSION_V2 = 2;
    const ITEMS_TYPE = 'interactions-array';

    /**
     * Wrap interactions data from v1 to v2 format before saving to DB.
     * - {items: [], version: 1} → {items: {$$type: 'interactions-array', value: []}, version: 2}
     * - duration/delay: {$$type: 'number', value: X} → {$$type: 'size', value: {size: X, unit: 'ms'}}
     */
    public static function wrap_for_db( $interactions ) {
        $decoded = self::decode( $interactions );

        if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
            return $interactions;
        }

        // Get items array (handle both v1 and already wrapped format)
        $items = $decoded['items'];
        if ( isset( $decoded['items']['$$type'] ) && $decoded['items']['$$type'] === self::ITEMS_TYPE ) {
            $items = isset( $decoded['items']['value'] ) ? $decoded['items']['value'] : [];
        }

        // Transform timing values in each interaction item
        $items = self::transform_items_timing_to_size( $items );

        $wrapped = [
            'items' => [
                '$$type' => self::ITEMS_TYPE,
                'value' => $items,
            ],
            'version' => self::VERSION_V2,
        ];

        return wp_json_encode( $wrapped );
    }

    /**
     * Unwrap interactions data from v2 to v1 format before sending to FE.
     * - {items: {$$type: 'interactions-array', value: []}, version: 2} → {items: [], version: 1}
     * - duration/delay: {$$type: 'size', value: {size: X, unit: 'ms'}} → {$$type: 'number', value: X}
     */
    public static function unwrap_for_frontend( $interactions ) {
        $decoded = self::decode( $interactions );

        if ( empty( $decoded ) || ! isset( $decoded['items'] ) ) {
            return $interactions;
        }

        // Get items array
        $items = $decoded['items'];
        if ( isset( $decoded['items']['$$type'] ) && $decoded['items']['$$type'] === self::ITEMS_TYPE ) {
            $items = isset( $decoded['items']['value'] ) ? $decoded['items']['value'] : [];
        }

        // Transform timing values back to number format
        $items = self::transform_items_timing_to_number( $items );

        $unwrapped = [
            'items' => $items,
            'version' => self::VERSION_V1,
        ];

        return wp_json_encode( $unwrapped );
    }

    /**
     * Transform duration/delay from number to size format for all items.
     * {$$type: 'number', value: X} → {$$type: 'size', value: {size: X, unit: 'ms'}}
     */
    private static function transform_items_timing_to_size( $items ) {
        if ( ! is_array( $items ) ) {
            return $items;
        }

        foreach ( $items as &$item ) {
            if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
                continue;
            }

            $timing_config = $item['value']['animation']['value']['timing_config']['value'] ?? null;
            if ( ! $timing_config ) {
                continue;
            }

            // Transform duration
            if ( isset( $timing_config['duration'] ) && 'number' === ( $timing_config['duration']['$$type'] ?? null ) ) {
                $item['value']['animation']['value']['timing_config']['value']['duration'] = self::number_to_size( $timing_config['duration'] );
            }

            // Transform delay
            if ( isset( $timing_config['delay'] ) && 'number' === ( $timing_config['delay']['$$type'] ?? null ) ) {
                $item['value']['animation']['value']['timing_config']['value']['delay'] = self::number_to_size( $timing_config['delay'] );
            }
        }

        return $items;
    }

    /**
     * Transform duration/delay from size to number format for all items.
     * {$$type: 'size', value: {size: X, unit: 'ms'}} → {$$type: 'number', value: X}
     */
    private static function transform_items_timing_to_number( $items ) {
        if ( ! is_array( $items ) ) {
            return $items;
        }

        foreach ( $items as &$item ) {
            if ( ! isset( $item['$$type'] ) || 'interaction-item' !== $item['$$type'] ) {
                continue;
            }

            $timing_config = $item['value']['animation']['value']['timing_config']['value'] ?? null;
            if ( ! $timing_config ) {
                continue;
            }

            // Transform duration
            if ( isset( $timing_config['duration'] ) && 'size' === ( $timing_config['duration']['$$type'] ?? null ) ) {
                $item['value']['animation']['value']['timing_config']['value']['duration'] = self::size_to_number( $timing_config['duration'] );
            }

            // Transform delay
            if ( isset( $timing_config['delay'] ) && 'size' === ( $timing_config['delay']['$$type'] ?? null ) ) {
                $item['value']['animation']['value']['timing_config']['value']['delay'] = self::size_to_number( $timing_config['delay'] );
            }
        }

        return $items;
    }

    /**
     * Convert number prop to size prop.
     * {$$type: 'number', value: 123} → {$$type: 'size', value: {size: 123, unit: 'ms'}}
     */
    private static function number_to_size( $number_prop ) {
        $value = $number_prop['value'] ?? 0;

        return [
            '$$type' => 'size',
            'value' => [
                'size' => $value,
                'unit' => 'ms',
            ],
        ];
    }

    /**
     * Convert size prop to number prop.
     * {$$type: 'size', value: {size: 123, unit: 'ms'}} → {$$type: 'number', value: 123}
     */
    private static function size_to_number( $size_prop ) {
        $size = $size_prop['value']['size'] ?? 0;

        return [
            '$$type' => 'number',
            'value' => $size,
        ];
    }

    /**
     * Decode interactions from string or return as-is if array.
     */
    private static function decode( $interactions ) {
        if ( is_array( $interactions ) ) {
            return $interactions;
        }

        if ( is_string( $interactions ) ) {
            $decoded = json_decode( $interactions, true );
            if ( json_last_error() === JSON_ERROR_NONE && is_array( $decoded ) ) {
                return $decoded;
            }
        }

        return [];
    }
}