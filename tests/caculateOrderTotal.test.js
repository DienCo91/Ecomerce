import { caculateOrderTotal } from '../server/utils/store';

describe('caculateOrderTotal - kiểm tra logic đúng', () => {
  test('Case 1: order không có sản phẩm', () => {
    const order = { products: [] };
    expect(caculateOrderTotal(order)).toBe(0);
  });

  test('Case 2: sản phẩm bị huỷ không được tính', () => {
    const order = { products: [{ totalPrice: 100, status: 'Cancelled' }] };
    expect(caculateOrderTotal(order)).toBe(0);
  });

  test('Case 3: sản phẩm hợp lệ được tính', () => {
    const order = { products: [{ totalPrice: 100, status: 'Active' }] };
    expect(caculateOrderTotal(order)).toBe(100);
  });

  test('Case 4: nhiều sản phẩm hợp lệ được cộng đúng', () => {
    const order = {
      products: [
        { totalPrice: 30, status: 'Active' },
        { totalPrice: 70, status: 'Delivered' }
      ]
    };
    expect(caculateOrderTotal(order)).toBe(100);
  });

  test('Case 5: sản phẩm huỷ không ảnh hưởng tổng', () => {
    const order = {
      products: [
        { totalPrice: 100, status: 'Cancelled' },
        { totalPrice: 50, status: 'Processing' }
      ]
    };
    expect(caculateOrderTotal(order)).toBe(50);
  });

  test('Case 6: sản phẩm có totalPrice = 0 vẫn hợp lệ', () => {
    const order = { products: [{ totalPrice: 0, status: 'Active' }] };
    expect(caculateOrderTotal(order)).toBe(0);
  });

  test('Case 7: sản phẩm không có totalPrice → phải xử lý tránh NaN', () => {
    const order = { products: [{ status: 'Active' }] };
    const result = caculateOrderTotal(order);
    expect(typeof result).toBe('number');
    expect(Number.isNaN(result)).toBe(false); // Không được NaN
  });

  test('Case 8: order không có trường "products" → nên throw', () => {
    const order = {};
    expect(() => caculateOrderTotal(order)).toThrow();
  });

  test('Case 9: sản phẩm không có "status" → vẫn được tính', () => {
    const order = { products: [{ totalPrice: 100 }] };
    expect(caculateOrderTotal(order)).toBe(100);
  });

  test('Case 10: totalPrice = null → không ảnh hưởng tổng', () => {
    const order = { products: [{ totalPrice: null, status: 'Active' }] };
    const result = caculateOrderTotal(order);
    expect(result).toBe(0); // null được hiểu là 0
  });

  test('Case 11: totalPrice là chuỗi → không được cộng như chuỗi', () => {
    const order = { products: [{ totalPrice: "50", status: 'Active' }] };
    const result = caculateOrderTotal(order);
    expect(typeof result).toBe('number'); // tránh lỗi "050"
    expect(result).toBe(50); // phải ép kiểu đúng
  });

  test('Case 12: totalPrice là NaN → phải bỏ qua hoặc cho 0', () => {
    const order = { products: [{ totalPrice: NaN, status: 'Active' }] };
    const result = caculateOrderTotal(order);
    expect(Number.isNaN(result)).toBe(false);
    expect(result).toBe(0);
  });

  test('Case 13: có sản phẩm bị âm giá → vẫn tính đúng tổng', () => {
    const order = {
      products: [
        { totalPrice: -10, status: 'Active' },
        { totalPrice: 50, status: 'Active' }
      ]
    };
    expect(caculateOrderTotal(order)).toBe(40); // -10 + 50
  });

  test('Case 14: sản phẩm có status không xác định → nên được tính', () => {
    const order = {
      products: [
        { totalPrice: 30, status: 'UnknownStatus' }
      ]
    };
    expect(caculateOrderTotal(order)).toBe(30); // nếu không phải "Cancelled", vẫn tính
  });
});
