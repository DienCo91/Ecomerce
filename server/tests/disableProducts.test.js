
const mongoose = require('mongoose');
const Product = require('../models/product');
const store = require('../utils/store');
const disableProducts = store.disableProducts;
 
const uri = 'mongodb+srv://admin:kFApJzqhiCPFNCe9@cluster0.cfniifh.mongodb.net/sqa?retryWrites=true&w=majority&appName=Cluster0';

beforeAll(async () => {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});
 
afterAll(async () => {
  await mongoose.disconnect();
});
 
describe('Hàm disableProducts với transaction', () => {
  it('Trường Hợp 1: Vô hiệu hóa sản phẩm cụ thể và rollback', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
 
    try {
      const product = new Product({
        name: 'Product 1',
        isActive: true
      });
 
      await product.save({ session });
      await disableProducts([product]);
 
      const updatedProduct = await Product.findById(product._id).session(session);
      expect(updatedProduct.isActive).toBe(false);
 
      await session.abortTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  });
 
  it('Trường Hợp 2: Xử lý danh sách sản phẩm trống', async () => {
    try{
      await disableProducts([])
    }
    catch (error) {
      expect(error).toBeInstanceOf(mongoose.mongo.MongoError);
    }
  });
 
  it('Trường Hợp 3: Xử lý danh sách sản phẩm là null', async () => {
    try{
      await disableProducts(null)
    }
    catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }
  });
 
  it('Trường Hợp 4: Xử lý danh sách sản phẩm là undefined', async () => {
    try{
      await disableProducts(undefined)
    }
    catch (error) {
      expect(error).toBeInstanceOf(TypeError);
    }
  });
 
  it('Trường Hợp 5: Vô hiệu hóa nhiều sản phẩm', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
 
    try {
      const products = await Product.create([
        { name: 'Product 1', isActive: true },
        { name: 'Product 2', isActive: true }
      ], { session });
 
      await disableProducts(products);
 
      const updatedProducts = await Product.find({ _id: { $in: products.map(p => p._id) } }).session(session);
      updatedProducts.forEach(product => {
        expect(product.isActive).toBe(false);
      });
 
      await session.abortTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  });
 
  it('Trường Hợp 6: Không gây lỗi khi sản phẩm không tồn tại', async () => {
    const fakeProduct = new Product({ _id: new mongoose.Types.ObjectId(), name: 'Fake Product', isActive: true });
    await expect(disableProducts([fakeProduct])).resolves.not.toThrow();
  });
 
  it('Trường Hợp 7: Không thay đổi sản phẩm đã bị vô hiệu hóa', async () => {
    const session = await mongoose.startSession();
    session.startTransaction();
 
    try {
      const product = new Product({
        name: 'Product 1',
        isActive: false
      });
 
      await product.save({ session });
      await disableProducts([product]);
 
      const updatedProduct = await Product.findById(product._id).session(session);
      expect(updatedProduct.isActive).toBe(false);
 
      await session.abortTransaction();
    } catch (error) {
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  });
 
  it('Trường Hợp 8: Xử lý sản phẩm không có _id', async () => {
    const productWithoutId = { name: 'Product without ID', isActive: true };
    await expect(disableProducts([productWithoutId])).resolves.not.toThrow();
  });
 
  it('Trường Hợp 9: Xử lý sản phẩm với _id không hợp lệ', async () => {
    const productWithInvalidId = { _id: 'invalid-id', name: 'Invalid ID Product', isActive: true };
   
    try {
      await disableProducts([productWithInvalidId]);
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.CastError);
    }
  });
});
