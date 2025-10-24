/**
 * Module Type Enum
 * Represents different module connection patterns in QR codes
 * Based on neighbor detection (top, right, bottom, left = 8, 4, 2, 1)
 */
export enum ModuleTypeEnum {
    /**
     *    [ ]
     * [#][#][#]
     *    [ ]
     */
    CONNECTOR_HORIZONTAL = 0b0101,

    /**
     *    [#]
     * [ ][#][ ]
     *    [#]
     */
    CONNECTOR_VERTICAL = 0b1010,

    /**
     *    [#]
     * [#][#][#]
     *    [#]
     */
    CONNECTOR_ALL = 0b1111,

    /**
     *    [ ]
     * [#][#][#]
     *    [#]
     */
    JUNCTION_BOTTOM = 0b0111,

    /**
     *    [#]
     * [#][#][ ]
     *    [#]
     */
    JUNCTION_LEFT = 0b1011,

    /**
     *    [#]
     * [#][#][#]
     *    [ ]
     */
    JUNCTION_TOP = 0b1101,

    /**
     *    [#]
     * [ ][#][#]
     *    [#]
     */
    JUNCTION_RIGHT = 0b1110,

    /**
     *    [#]
     * [ ][#][#]
     *    [ ]
     */
    ELBOW_BOTTOM_LEFT = 0b1100,

    /**
     *    [#]
     * [#][#][ ]
     *    [ ]
     */
    ELBOW_BOTTOM_RIGHT= 0b1001,

    /**
     *    [ ]
     * [ ][#][#]
     *    [#]
     */
    ELBOW_TOP_LEFT = 0b0110,

    /**
     *    [ ]
     * [#][#][ ]
     *    [#]
     */
    ELBOW_TOP_RIGHT = 0b0011,

    /**
     *    [ ]
     * [ ][#][ ]
     *    [#]
     */
    END_CAP_TOP = 0b0010,

    /**
     *    [#]
     * [ ][#][ ]
     *    [ ]
     */
    END_CAP_BOTTOM = 0b1000,

    /**
     *    [ ]
     * [ ][#][#]
     *    [ ]
     */
    END_CAP_LEFT = 0b0100,

    /**
     *    [ ]
     * [#][#][ ]
     *    [ ]
     */
    END_CAP_RIGHT = 0b0001,

    /**
     *    [ ]
     * [ ][#][ ]
     *    [ ]
     */
    SINGLE = 0b0000,
}
