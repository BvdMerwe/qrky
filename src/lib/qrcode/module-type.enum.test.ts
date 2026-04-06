import { describe, it, expect } from 'vitest';
import { ModuleTypeEnum } from '@/lib/qrcode/module-type.enum';

describe('ModuleTypeEnum', () => {
    it('should have correct binary values for all module types', () => {
        expect(ModuleTypeEnum.SINGLE).toBe(0b0000);                    // 0
        expect(ModuleTypeEnum.END_CAP_RIGHT).toBe(0b0001);            // 1
        expect(ModuleTypeEnum.END_CAP_TOP).toBe(0b0010);              // 2
        expect(ModuleTypeEnum.ELBOW_TOP_RIGHT).toBe(0b0011);          // 3
        expect(ModuleTypeEnum.END_CAP_LEFT).toBe(0b0100);             // 4
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL).toBe(0b0101);      // 5
        expect(ModuleTypeEnum.ELBOW_TOP_LEFT).toBe(0b0110);           // 6
        expect(ModuleTypeEnum.JUNCTION_BOTTOM).toBe(0b0111);          // 7
        expect(ModuleTypeEnum.END_CAP_BOTTOM).toBe(0b1000);            // 8
        expect(ModuleTypeEnum.ELBOW_BOTTOM_RIGHT).toBe(0b1001);       // 9
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL).toBe(0b1010);      // 10
        expect(ModuleTypeEnum.JUNCTION_LEFT).toBe(0b1011);            // 11
        expect(ModuleTypeEnum.ELBOW_BOTTOM_LEFT).toBe(0b1100);         // 12
        expect(ModuleTypeEnum.JUNCTION_TOP).toBe(0b1101);             // 13
        expect(ModuleTypeEnum.JUNCTION_RIGHT).toBe(0b1110);          // 14
        expect(ModuleTypeEnum.CONNECTOR_ALL).toBe(0b1111);             // 15
    });

    it('should use correct neighbor detection bits (top=8, right=4, bottom=2, left=1)', () => {
        // Test that enum values correctly represent neighbor patterns
        // SINGLE: no neighbors (0)
        expect(ModuleTypeEnum.SINGLE & 0b1000).toBe(0); // no top
        expect(ModuleTypeEnum.SINGLE & 0b0100).toBe(0); // no right
        expect(ModuleTypeEnum.SINGLE & 0b0010).toBe(0); // no bottom
        expect(ModuleTypeEnum.SINGLE & 0b0001).toBe(0); // no left

        // CONNECTOR_HORIZONTAL: left + right (4 + 1 = 5)
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0100).toBe(0b0100); // has right
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0001).toBe(0b0001); // has left
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b1000).toBe(0);      // no top
        expect(ModuleTypeEnum.CONNECTOR_HORIZONTAL & 0b0010).toBe(0);      // no bottom

        // CONNECTOR_VERTICAL: top + bottom (8 + 2 = 10)
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b1000).toBe(0b1000); // has top
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0100).toBe(0);      // no right
        expect(ModuleTypeEnum.CONNECTOR_VERTICAL & 0b0001).toBe(0);      // no left

        // END_CAP_TOP: bottom only (2)
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.END_CAP_TOP & 0b1000).toBe(0);     // no top
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0100).toBe(0);     // no right
        expect(ModuleTypeEnum.END_CAP_TOP & 0b0001).toBe(0);     // no left

        // JUNCTION_BOTTOM: left + right + bottom (1 + 4 + 2 = 7)
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0001).toBe(0b0001); // has left
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0100).toBe(0b0100); // has right
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b0010).toBe(0b0010); // has bottom
        expect(ModuleTypeEnum.JUNCTION_BOTTOM & 0b1000).toBe(0);      // no top
    });

    it('should have all expected enum values', () => {
        const values = Object.values(ModuleTypeEnum).filter(v => typeof v === 'number');
        expect(values).toHaveLength(16);
        expect(values.sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    });
});
