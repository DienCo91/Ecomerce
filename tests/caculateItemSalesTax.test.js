import { caculateItemsSalesTax } from '../server/utils/store';
const taxConfig = require('../server/config/tax');

describe('Test hàm caculateItemsSalesTax', () => {
    it('// Trường hợp 1: Một sản phẩm có thuế, số lượng bình thường', () => {
      const items = [{ price: 100, quantity: 2, taxable: true }];
      const [result] = caculateItemsSalesTax(items);
  
      expect(result.totalPrice).toBe(200);
      expect(result.totalTax).toBe(10); // 5% của 200
      expect(result.priceWithTax).toBe(210);
    });
  
    it('// Trường hợp 2: Một sản phẩm không chịu thuế', () => {
      const items = [{ price: 50, quantity: 3, taxable: false }];
      const [result] = caculateItemsSalesTax(items);
  
      expect(result.totalPrice).toBe(150);
      expect(result.totalTax).toBe(0);
      expect(result.priceWithTax).toBe(0);
    });
  
    it('// Trường hợp 3: Giá bằng 0', () => {
      const items = [{ price: 0, quantity: 5, taxable: true }];
      const [result] = caculateItemsSalesTax(items);
  
      expect(result.totalPrice).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.priceWithTax).toBe(0);
    });
  
    it('// Trường hợp 4: Số lượng bằng 0', () => {
      const items = [{ price: 100, quantity: 0, taxable: true }];
      const [result] = caculateItemsSalesTax(items);
  
      expect(result.totalPrice).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.priceWithTax).toBe(0);
    });
  
    it('// Trường hợp 5: Giá âm nhưng vẫn tính thuế (không hợp lệ)', () => {
        const items = [{ price: -100, quantity: 1, taxable: true }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalTax).toBe(0); // Mong đợi KHÔNG tính thuế → sẽ FAIL vì hàm vẫn tính (-5)
    });
      
    it('// Trường hợp 6: Số lượng âm nhưng vẫn tính thuế (không hợp lệ)', () => {
        const items = [{ price: 50, quantity: -2, taxable: true }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalTax).toBe(0); // Mong đợi KHÔNG tính thuế → sẽ FAIL vì hàm vẫn tính (-5)
    });
    
    it('// Trường hợp 7: Giá và số lượng đều âm nhưng vẫn tính thuế', () => {
        const items = [{ price: -10, quantity: -3, taxable: true }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalTax).toBe(0); // Mong đợi KHÔNG tính thuế → sẽ FAIL vì hàm tính ra 1.5
    });
      
  
    it('// Trường hợp 8: Thiếu trường taxable (mặc định là false)', () => {
      const items = [{ price: 20, quantity: 2 }];
      const [result] = caculateItemsSalesTax(items);
      expect(result.totalPrice).toBe(40);
      expect(result.totalTax).toBe(0);
      expect(result.priceWithTax).toBe(0);
    });
  
    it('// Trường hợp 9: Danh sách sản phẩm rỗng', () => {
      const items = [];
      const result = caculateItemsSalesTax(items);
  
      expect(result).toEqual([]);
    });
    
    it('// Trường hợp 10: taxable là null', () => {
        const items = [{ price: 100, quantity: 1, taxable: null }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalTax).toBe(0);
        expect(result.priceWithTax).toBe(0); // Không nên tính thuế
    });
    
    it('// Trường hợp 11: taxable là string "true"', () => {
        const items = [{ price: 50, quantity: 2, taxable: "true" }];
        const [result] = caculateItemsSalesTax(items);
      
        // Hàm hiện tại sẽ vẫn tính thuế → test nên xác định điều này (nếu nghiệp vụ không cho phép thì test sẽ fail)
        expect(result.totalTax).toBe(5); // 5% của 100
        expect(result.priceWithTax).toBe(105);
    });
    
    it('// Trường hợp 12: thiếu price (mong đợi hàm throw lỗi)', () => {
        const items = [{ quantity: 3, taxable: true }];
      
        expect(() => {
          caculateItemsSalesTax(items);
        }).toThrow('Thiếu hoặc sai kiểu trường price');
      });
      
      it('// Trường hợp 13: thiếu quantity (mong đợi hàm throw lỗi)', () => {
        const items = [{ price: 100, taxable: true }];
      
        expect(() => {
          caculateItemsSalesTax(items);
        }).toThrow('Thiếu hoặc sai kiểu trường quantity');
      });
    
    it('// Trường hợp 14: Giá và số lượng là chuỗi số', () => {
        const items = [{ price: "100", quantity: "2", taxable: true }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalPrice).toBe(200); // implicit convert OK
        expect(result.totalTax).toBe(10);    // vẫn tính đúng nếu không validate
        expect(result.priceWithTax).toBe(210);
    });
      
    it('// Trường hợp 15: taxRate = 0', () => {
        const originalTaxRate = taxConfig.stateTaxRate;
        taxConfig.stateTaxRate = 0;
      
        const items = [{ price: 100, quantity: 2, taxable: true }];
        const [result] = caculateItemsSalesTax(items);
      
        expect(result.totalTax).toBe(0);
        expect(result.priceWithTax).toBe(200);
      
        taxConfig.stateTaxRate = originalTaxRate; // reset lại
    });
  });


