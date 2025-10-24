# QRkySVG

A TypeScript implementation of customizable SVG QR code generation with rounded module shapes and logo support.

## Overview

`QRkySVG` extends the `QRMarkupSVG` class from `@chillerlan/qrcode` to provide enhanced QR code rendering with:
- **Rounded corners** on QR code modules based on neighbor detection
- **SVG logo embedding** in the center of the QR code
- **Customizable corner radius** for aesthetic QR codes

## Features

### 1. Smart Module Shapes
Each QR code module is rendered with intelligent corner rounding based on its neighbors:
- Isolated modules get fully rounded corners
- Connected modules have smooth transitions
- End caps have appropriate rounding
- Elbows and junctions maintain clean connections

### 2. Logo Embedding
Embed an SVG logo in the center of your QR code:
- Automatic sizing and positioning
- Configurable scale
- Optional logo space clearing
- CSS class support for styling

### 3. Configurable Radius
Control the roundness of corners with the `circleRadius` option (0-0.5).

## Usage

### Basic Usage with QRkyOptions

```typescript
import { QRCode, ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { QRkySVG, QRkyOptions } from '@/lib/qrcode';

// Create options with validation and defaults
const options = new QRkyOptions({
    outputInterface: QRkySVG,
    eccLevel: ECC_H,
    circleRadius: 0.45,           // Corner roundness (0-0.5)
    svgLogo: '/path/to/logo.svg', // Optional: null to disable
    clearLogoSpace: true,          // Clear space for logo
    svgLogoScale: 0.35,            // Logo scale (10-30% recommended)
    svgLogoScaleMinimum: 0.1,      // Min 10%
    svgLogoScaleMaximum: 0.3,      // Max 30%
    svgLogoCssClass: 'qr-logo',    // CSS class for logo
    svgViewBoxSize: 1920,          // SVG viewBox size
    addQuietzone: true,
    quietzoneSize: 2,
});

const qrcode = (new QRCode(options)).render('https://example.com');
```

### Without Options Class

```typescript
import { QRCode, ECC_H } from '@chillerlan/qrcode/dist/js-qrcode-node-src.cjs';
import { QRkySVG } from '@/lib/qrcode';

const qrcode = (new QRCode({
    outputInterface: QRkySVG,
    eccLevel: ECC_H,
    circleRadius: 0.45,
    svgViewBoxSize: 1920,
    addQuietzone: true,
})).render('https://example.com');
```

## Options

### QRkyOptions

The `QRkyOptions` class extends `QROptions` and provides additional validation:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `circleRadius` | `number` | `0.4` | Corner radius (0-0.5) |
| `svgLogo` | `string \| null` | `null` | Path to SVG logo file (validated) |
| `clearLogoSpace` | `boolean` | `true` | Clear space for logo |
| `svgLogoScale` | `number` | `0.2` | Logo size (clamped to min/max) |
| `svgLogoScaleMinimum` | `number` | `0` | Minimum logo scale (0-1) |
| `svgLogoScaleMaximum` | `number` | `1` | Maximum logo scale (0-1) |
| `svgLogoCssClass` | `string` | `''` | CSS class for logo group |
| `svgViewBoxSize` | `number` | `300` | SVG viewBox size |

### Validation Features

- **Logo Path Validation**: Checks if file exists and is readable
- **Scale Clamping**: Automatically clamps `svgLogoScale` between min/max
- **Type Safety**: Full TypeScript type support

## Module Types

The library uses a `ModuleTypeEnum` to classify module connection patterns:

- `SINGLE` - Isolated module
- `END_CAP_*` - Modules with one neighbor
- `ELBOW_*` - L-shaped connections
- `CONNECTOR_*` - Straight connections
- `JUNCTION_*` - T-shaped connections
- `CONNECTOR_ALL` - Cross-shaped connections

## Implementation Details

### Neighbor Detection
Each module checks its four neighbors (top, right, bottom, left) using binary flags:
- Top: `1000` (8)
- Right: `0100` (4)
- Bottom: `0010` (2)
- Left: `0001` (1)

### Path Generation
The `getRoundedSquarePath()` method generates SVG paths with selective corner rounding using:
- SVG move (`M`) and horizontal/vertical line (`h`/`v`) commands
- Quadratic Bézier curves (`q`) for smooth corners
- Efficient path closing (`z`)

## Architecture

```
src/lib/qrcode/
├── QRkySVG.ts           # Main QR code renderer
├── QRkyOptions.ts       # Options class with validation
├── module-type.enum.ts  # Module connection patterns
├── index.ts             # Public exports
└── README.md            # This file
```

## Comparison with PHP Implementation

This is a direct TypeScript port of the PHP `NovaQRCodeSVG` and `NovaQRCodeOptions` classes:

### QRkySVG (NovaQRCodeSVG)
- TypeScript type safety
- Node.js file system integration
- Same rendering algorithm and output
- Identical module shape detection logic

### QRkyOptions (NovaQRCodeOptions)
- Extends QROptions with logo-specific options
- File validation using Node.js `fs` module
- Automatic scale clamping
- TypeScript interfaces for type safety

## License

MIT
