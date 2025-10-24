/**
 * Class QRkySVG
 * 
 * TypeScript port of NovaQRCodeSVG
 * Create SVG QR Codes with embedded logos and customizable module shapes
 */

import { QRMarkupSVG, QRMatrix } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { ModuleTypeEnum } from './module-type.enum';
import { QRkyOptions } from './QRkyOptions';
import { readFileSync } from 'fs';
import {DOMParser, XMLSerializer} from "@xmldom/xmldom";

export class QRkySVG extends QRMarkupSVG {
    protected declare options: QRkyOptions;
    protected declare matrix: QRMatrix;
    protected declare moduleCount: number;

    /**
     * Override header to add width and height attributes
     */
    protected header(): string {
        this.options.svgAddXmlHeader = false;
        let header = super.header();
        const viewBoxSize = this.options.svgViewBoxSize ?? 300;

        if (this.options.drawLightModules) {
            header += `<rect x="0" y="0" width="${viewBoxSize}" height="${viewBoxSize}" fill="#ffffff"></rect>`
        }

        return header.replace('>', ` width="${viewBoxSize}" height="${viewBoxSize}">`);
    }

    /**
     * Generate SVG paths with optional logo space and embedded logo
     */
    protected paths(): string {
        if (this.options.clearLogoSpace) {
            const size = Math.ceil(this.moduleCount * (this.options.svgLogoScale ?? 0.2));
            this.matrix.setLogoSpace(size, size);
        }

        let svg = super.paths();

        if (this.options.svgLogo !== null && this.options.svgLogo !== undefined) {
            svg += this.getLogo();
        }

        return svg;
    }

    /**
     * Generate individual module with rounded corners based on neighbors
     */
    protected module(x: number, y: number, M_TYPE: number): string {
        if (this.matrix.check(x, y)) {
            // Detect neighbors using binary flags
            let neighbors = 0;
            neighbors |= this.matrix.check(x, y - 1) ? 8 : 0;    // top    (1000)
            neighbors |= this.matrix.check(x + 1, y) ? 4 : 0;    // right  (0100)
            neighbors |= this.matrix.check(x, y + 1) ? 2 : 0;    // bottom (0010)
            neighbors |= this.matrix.check(x - 1, y) ? 1 : 0;    // left   (0001)

            return this.determineModuleShape(x, y, neighbors);
        } else {
            return super.module(x, y, M_TYPE);
        }
    }

    /**
     * Determine the shape of a module based on its neighbors
     */
    private determineModuleShape(x: number, y: number, neighbors: number): string {
        const radius = Math.max(0, Math.min(0.5, this.options.circleRadius ?? 0.4));

        switch (neighbors) {
            case ModuleTypeEnum.SINGLE:
                // Isolated square with all corners rounded
                return this.getRoundedSquarePath(x, y, 0b1111, radius);

            case ModuleTypeEnum.CONNECTOR_HORIZONTAL:
                // Rectangle spanning left-right (no rounded corners)
                return this.getRoundedSquarePath(x, y, 0b0000, radius);

            case ModuleTypeEnum.CONNECTOR_VERTICAL:
                // Rectangle spanning top-bottom (no rounded corners)
                return this.getRoundedSquarePath(x, y, 0b0000, radius);

            case ModuleTypeEnum.END_CAP_TOP:
                // Rounded top corners, straight bottom
                return this.getRoundedSquarePath(x, y, 0b1100, radius);

            case ModuleTypeEnum.END_CAP_RIGHT:
                // Rounded right corners, straight left
                return this.getRoundedSquarePath(x, y, 0b0110, radius);

            case ModuleTypeEnum.END_CAP_BOTTOM:
                // Rounded bottom corners, straight top
                return this.getRoundedSquarePath(x, y, 0b0011, radius);

            case ModuleTypeEnum.END_CAP_LEFT:
                // Rounded left corners, straight right
                return this.getRoundedSquarePath(x, y, 0b1001, radius);

            case ModuleTypeEnum.ELBOW_TOP_RIGHT:
                // Rounded top-right corner only
                return this.getRoundedSquarePath(x, y, 0b0100, radius);

            case ModuleTypeEnum.ELBOW_TOP_LEFT:
                // Rounded top-left corner only
                return this.getRoundedSquarePath(x, y, 0b1000, radius);

            case ModuleTypeEnum.ELBOW_BOTTOM_RIGHT:
                // Rounded bottom-right corner only
                return this.getRoundedSquarePath(x, y, 0b0010, radius);

            case ModuleTypeEnum.ELBOW_BOTTOM_LEFT:
                // Rounded bottom-left corner only
                return this.getRoundedSquarePath(x, y, 0b0001, radius);

            case ModuleTypeEnum.JUNCTION_TOP:
            case ModuleTypeEnum.JUNCTION_RIGHT:
            case ModuleTypeEnum.JUNCTION_BOTTOM:
            case ModuleTypeEnum.JUNCTION_LEFT:
            case ModuleTypeEnum.CONNECTOR_ALL:
            default:
                // No rounded corners for junctions
                return this.getRoundedSquarePath(x, y, 0b0000, radius);
        }
    }

    /**
     * Generate an SVG path for a square with selectively rounded corners
     * 
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param roundedCorners - Bitmask: top-left(3), top-right(2), bottom-right(1), bottom-left(0)
     * @param radius - Corner radius (0-0.5)
     */
    private getRoundedSquarePath(x: number, y: number, roundedCorners: number, radius: number): string {
        // Bit positions: top-left(3), top-right(2), bottom-right(1), bottom-left(0)
        const topLeft = (roundedCorners & 0b1000) !== 0;
        const topRight = (roundedCorners & 0b0100) !== 0;
        const bottomRight = (roundedCorners & 0b0010) !== 0;
        const bottomLeft = (roundedCorners & 0b0001) !== 0;

        let path = "M ";

        // Start position (top-left corner)
        if (topLeft) {
            path += `${x + radius} ${y}`;
        } else {
            path += `${x} ${y}`;
        }

        // Top edge to top-right corner
        if (topRight) {
            path += ` h ${1 - radius - (topLeft ? radius : 0)}`;
            path += ` q ${radius},0 ${radius},${radius}`;
        } else {
            path += ` h ${1 - (topLeft ? radius : 0)}`;
        }

        // Right edge to bottom-right corner
        if (bottomRight) {
            path += ` v ${1 - radius - (topRight ? radius : 0)}`;
            path += ` q 0,${radius} -${radius},${radius}`;
        } else {
            path += ` v ${1 - (topRight ? radius : 0)}`;
        }

        // Bottom edge to bottom-left corner
        if (bottomLeft) {
            path += ` h -${1 - radius - (bottomRight ? radius : 0)}`;
            path += ` q -${radius},0 -${radius},-${radius}`;
        } else {
            path += ` h -${1 - (bottomRight ? radius : 0)}`;
        }

        // Left edge back to start
        if (topLeft) {
            path += ` v -${1 - radius - (bottomLeft ? radius : 0)}`;
            path += ` q 0,-${radius} ${radius},-${radius}`;
        } else {
            path += ` v -${1 - (bottomLeft ? radius : 0)}`;
        }

        path += " z";

        return path;
    }

    /**
     * Generate a <g> element containing the SVG logo positioned in the center
     * 
     * @returns SVG group element with embedded logo
     */
    protected getLogo(): string {
        if (!this.options.svgLogo) {
            return '';
        }

        try {
            // Read the SVG logo file
            const svgLogoContents = readFileSync(this.options.svgLogo, 'utf-8');

            const parser = new DOMParser();
            const svgDom = parser.parseFromString(svgLogoContents, "image/svg+xml");
            const svgElement = svgDom.documentElement;
            svgElement.setAttribute("width", this.options.svgViewBoxSize.toString());
            svgElement.setAttribute("height", this.options.svgViewBoxSize.toString());

            // Extract width and height from SVG attributes
            const width = this.options.svgViewBoxSize;
            const height = this.options.svgViewBoxSize;
            const sizeMax = Math.max(width, height);
            console.log(width, height);

            // Normalize to QR code size and scale
            const sizeRelative = this.moduleCount / sizeMax;
            const sizeScaled = sizeRelative * (this.options.svgLogoScale ?? 0.2);
            console.log(sizeMax, sizeScaled);
            const eol = this.options.eol ?? '\n';
            const cssClass = this.options.svgLogoCssClass ?? 'logo';
            const logoScale = this.options.svgLogoScale ?? 0.2;
            const translateOffset = (this.moduleCount / 2) - (this.moduleCount * logoScale / 2);
            const serialized = new XMLSerializer().serializeToString(svgElement);

            return `${eol}<g transform="translate(${translateOffset} ${translateOffset}) scale(${sizeScaled})" class="${cssClass}">${eol}\t${serialized}${eol}</g>`;
        } catch (error) {
            console.error('Error loading SVG logo:', error);
            return '';
        }
    }
}
