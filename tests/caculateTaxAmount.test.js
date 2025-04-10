import { caculateTaxAmount } from '../server/utils/store';

describe('Hàm caculateTaxAmount', () => {
  it('TC1: Sản phẩm chịu thuế, priceWithTax = 0', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 100, taxable: true },
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Thuế = 100 * 0.05 = 5
    // Tổng: 100 + 5 = 105
    expect(result.products[0].totalTax).toBe(5);
    expect(result.totalTax).toBe(5);
    expect(result.products[0].priceWithTax).toBe(105);
    expect(result.totalWithTax).toBe(105);
  });

  it('TC2: Sản phẩm không chịu thuế', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 100, taxable: false },
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Không có thuế
    expect(result.products[0].totalTax).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.products[0].priceWithTax).toBe(100);
    expect(result.totalWithTax).toBe(100);
  });

  it('TC3: Sản phẩm đã có priceWithTax khác 0', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 100, taxable: true },
          status: 'Confirmed',
          priceWithTax: 999
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Đã có giá, không tính lại thuế
    expect(result.products[0].totalTax).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.products[0].priceWithTax).toBe(999);
  });

  it('TC4: Sản phẩm bị huỷ thì không tính thuế', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 200, taxable: true },
          status: 'Cancelled',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Không tính thuế nếu trạng thái là Cancelled
    expect(result.products[0].totalTax).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.products[0].priceWithTax).toBe(200);
  });

  it('TC5: Sản phẩm không có product.price thì dùng purchasePrice', () => {
    const order = {
      products: [
        {
          quantity: 2,
          product: { taxable: true },
          purchasePrice: 50,
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Thuế mỗi sản phẩm = 50 * 0.05 = 2.5
    // Tổng thuế = 2.5 * 2 = 5
    // Tổng có thuế = 50 * 2 + 5 = 105
    expect(result.products[0].totalTax).toBe(5);
    expect(result.totalTax).toBe(5);
    expect(result.products[0].priceWithTax).toBe(55); // 50 + 5
  });

  it('TC6: Nhiều sản phẩm, chỉ 1 sản phẩm chịu thuế', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 100, taxable: true },
          status: 'Confirmed',
          priceWithTax: 0
        },
        {
          quantity: 1,
          product: { price: 200, taxable: false },
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Sản phẩm 1: thuế = 100 * 0.05 = 5 → tổng = 105
    // Sản phẩm 2: không thuế → tổng = 200
    // Tổng thuế = 5, tổng đơn = 305
    expect(result.totalTax).toBe(5);
    expect(result.totalWithTax).toBe(305);
  });

  it('TC7: Không có sản phẩm nào trong order', () => {
    const order = { products: [] };
    const result = caculateTaxAmount(order);

    // Không có sản phẩm
    expect(result.totalTax).toBe(0);
    expect(result.totalWithTax).toBe(0);
  });

  it('TC8: Sản phẩm không có product object', () => {
    const order = {
      products: [
        {
          quantity: 1,
          status: 'Confirmed',
          purchasePrice: 300,
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Không có product.taxable → không tính thuế
    expect(result.products[0].totalTax).toBe(0);
    expect(result.totalTax).toBe(0);
    expect(result.products[0].priceWithTax).toBe(300);
  });

  it('TC9: Sản phẩm chịu thuế với số lượng > 1', () => {
    const order = {
      products: [
        {
          quantity: 2,
          product: { price: 100, taxable: true },
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };
    const result = caculateTaxAmount(order);

    // Thuế mỗi sản phẩm = 100 * 0.05 = 5
    // Tổng thuế = 5 * 2 = 10
    // Tổng có thuế = 100 * 2 + 10 = 210
    expect(result.products[0].totalTax).toBe(10);
    expect(result.totalTax).toBe(10);
    expect(result.products[0].priceWithTax).toBe(110); // 100 + 10/2
    expect(result.totalWithTax).toBe(210);
  });

  it('TC1010: order.products = undefined → không lỗi', () => {
    const order = {};
    const result = caculateTaxAmount(order);

    // Không có sản phẩm, không lỗi
    expect(result.totalTax).toBe(0);
    expect(result.totalWithTax).toBe(0);
    expect(result.products).toEqual([]);
  });

  it('TC1111: Lỗi xảy ra trong tính toán → trả về order không crash', () => {
    const order = {
      products: [
        {
          quantity: 1,
          product: { price: 'invalid', taxable: true }, // gây lỗi nhân chuỗi
          status: 'Confirmed',
          priceWithTax: 0
        }
      ]
    };

    expect(() => caculateTaxAmount(order)).not.toThrow();
  });
});
