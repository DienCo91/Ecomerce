const storeUtils = require('../server/utils/store.js');
    describe('formatOrders', () => {
});
expect(result[1].products).toBeUndefined();
expect(spy).toHaveBeenCalledTimes(1);

it('should handle empty order array gracefully', () => {
    console.log('🧪 Test: xử lý mảng order rỗng');
    const result = storeUtils.formatOrders([]);
    expect(result).toEqual([]);
});

it('should handle missing cart field without error', () => {
    console.log('🧪 Test: xử lý order không có cart');
    const spy = jest.spyOn(storeUtils, 'caculateTaxAmount').mockImplementation(order => order);
    const orders = [
        {
            _id: 'order3',
            total: 300,
            created: '2024-04-08'
            // cart missing hoàn toàn
        }
    ];
    const result = storeUtils.formatOrders(orders);
    expect(result.length).toBe(1);
    expect(result[0]._id).toBe('order3');
    expect(result[0].products).toBeUndefined();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
});

it('should handle cart without products gracefully', () => {
    console.log('🧪 Test: xử lý order có cart nhưng không có products');

    const spy = jest.spyOn(storeUtils, 'caculateTaxAmount').mockImplementation(order => order);
    const orders = [
        {
            _id: 'order4',
            total: 123.456,
            created: '2024-04-07',
            cart: {} // cart có nhưng không có products
        }
    ];
    const result = storeUtils.formatOrders(orders);
    expect(result.length).toBe(1);
    expect(result[0]._id).toBe('order4');
    expect(result[0].products).toBeUndefined();
    expect(result[0].total).toBe(123.46);
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
});

it('should format orders correctly and call caculateTaxAmount for orders with products', () => {
    console.log('🧪 Test: format orders có products và gọi tính thuế');

    const spy = jest.spyOn(storeUtils, 'caculateTaxAmount').mockImplementation(order => ({
        ...order,
        totalTax: 5,
        totalWithTax: order.total + 5
    }));
    const orders = [
        {
            _id: 'order1',
            total: 100.456,
            created: '2024-04-10',
            cart: {
                products: [
                    { product: { price: 50, taxable: true }, quantity: 2, status: 'Confirmed' }
                ]
            }
        },
        {
            _id: 'order2',
            total: 200,
            created: '2024-04-09',
            cart: {} // không có products
        }
    ];
    const result = storeUtils.formatOrders(orders);
    expect(result.length).toBe(2);
    expect(result[0]).toMatchObject({
        _id: 'order1',
        total: 100.46,
        created: '2024-04-10',
        totalTax: 5,
        totalWithTax: 105.46
    });
    expect(result[0].products).toBeDefined();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ _id: 'order1' }));
    expect(result[1]).toMatchObject({
        _id: 'order2',
        total: 200,
        created: '2024-04-09'
    });
    spy.mockRestore();
});