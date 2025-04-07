import { isDisabledMerchantAccount } from '../client/app/utils/app';

describe('Test hàm isDisabledMerchantAccount', () => {
  it('// Trường hợp 1: User có role là Merchant và merchant đang bị vô hiệu hóa (isActive = false)', () => {
    const user = {
      role: 'ROLE MERCHANT',
      merchant: { isActive: false }
    };
    expect(isDisabledMerchantAccount(user)).toBe(true); // Kỳ vọng trả về true
  });

  it('// Trường hợp 2: User có role là Merchant nhưng merchant đang hoạt động (isActive = true)', () => {
    const user = {
      role: 'ROLE MERCHANT',
      merchant: { isActive: true }
    };
    expect(isDisabledMerchantAccount(user)).toBe(false); // Kỳ vọng trả về false
  });

  it('// Trường hợp 3: User có role là Merchant nhưng merchant bị null', () => {
    const user = {
      role: 'ROLE MERCHANT',
      merchant: null
    };
    expect(isDisabledMerchantAccount(user)).toBe(false); // Kỳ vọng trả về false
  });

  it('// Trường hợp 4: User không phải là Merchant (role là ROLE ADMIN) nhưng merchant không active', () => {
    const user = {
      role: 'ROLE ADMIN',
      merchant: { isActive: false }
    };
    expect(isDisabledMerchantAccount(user)).toBe(false); // Kỳ vọng trả về false
  });

  it('// Trường hợp 5: User không phải là Merchant và không có merchant object', () => {
    const user = {
      role: 'ROLE MEMBER'
    };
    expect(isDisabledMerchantAccount(user)).toBe(false); // Kỳ vọng trả về false
  });

  it('// Trường hợp 6: Truyền vào user rỗng {}', () => {
    const user = {};
    expect(isDisabledMerchantAccount(user)).toBe(false); // Kỳ vọng trả về false
  });
});
