import { calculatePurchaseQuantity } from '../client/app/containers/Cart/actions.js';
describe('calculatePurchaseQuantity', () => {
    test('should return 1 when inventory is 10 (<= 25)', () => {
        expect(calculatePurchaseQuantity(10)).toBe(1);
    });
    test('should return 5 when inventory is 50 (between 26 and 100)', () => {
        expect(calculatePurchaseQuantity(50)).toBe(5);
    });
    test('should return 25 when inventory is 200 (between 101 and 499)', () => {
        expect(calculatePurchaseQuantity(200)).toBe(25);
    });
    test('should return 50 when inventory is 500 (>= 500)', () => {
        expect(calculatePurchaseQuantity(600)).toBe(50);
    });
    // test phủ nhánh else if (false case)
    test('should not return 5 when inventory is 101', () => {
        expect(calculatePurchaseQuantity(101)).not.toBe(5);
    });
    // test phủ nhánh cuối (else - false case)
    test('should not return 50 when inventory is 499', () => {
        expect(calculatePurchaseQuantity(450)).not.toBe(50);
    });
    test('should return 1 when inventory is 25 (boundary)', () => {
        expect(calculatePurchaseQuantity(25)).toBe(1);
    });
    test('should return 5 when inventory is 26 (boundary)', () => {
        expect(calculatePurchaseQuantity(26)).toBe(5);
    });
    test('should return 5 when inventory is 100 (boundary)', () => {
        expect(calculatePurchaseQuantity(100)).toBe(5);
    });
    test('should return 25 when inventory is 101 (boundary)', () => {
        expect(calculatePurchaseQuantity(101)).toBe(25);
    });
    test('should return 25 when inventory is 499 (boundary)', () => {
        expect(calculatePurchaseQuantity(499)).toBe(25);
    });
    test('should return 50 when inventory is 500 (boundary)', () => {
        expect(calculatePurchaseQuantity(500)).toBe(50);
    });
});
