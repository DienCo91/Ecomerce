import { formatDate } from '../client/app/utils/date';

describe('Test hàm formatDate', () => {
  it('// Trường hợp 1: Truyền vào chuỗi ngày hợp lệ dạng ISO', () => {
    const input = '2023-04-08T00:00:00Z';
    expect(formatDate(input)).toBe('Saturday, Apr 8, 2023'); // Kỳ vọng định dạng đúng
  });

  it('// Trường hợp 2: Truyền vào đối tượng Date hợp lệ', () => {
    const input = new Date('2022-12-25T00:00:00Z');
    expect(formatDate(input)).toBe('Sunday, Dec 25, 2022');
  });

  it('// Trường hợp 3: Truyền vào giá trị timestamp (milliseconds)', () => {
    const input = Date.UTC(2024, 0, 1); // Tương ứng với 1/1/2024 UTC
    expect(formatDate(input)).toBe('Monday, Jan 1, 2024');
  });

  it('// Trường hợp 4: Truyền vào chuỗi không phải ngày hợp lệ', () => {
    const input = 'abc-not-a-date';
    expect(formatDate(input)).toBe('Invalid Date');
  });

  it('// Trường hợp 5: Truyền vào chuỗi rỗng', () => {
    const input = '';
    expect(formatDate(input)).toBe('Invalid Date');
  });

  it('// Trường hợp 6: Truyền vào null', () => {
    const input = null;
    expect(formatDate(input)).toBe('Invalid Date');
  });

  it('// Trường hợp 7: Truyền vào undefined', () => {
    expect(formatDate(undefined)).toBe('Invalid Date');
  });

  it('// Trường hợp 8: Truyền vào số timestamp cụ thể', () => {
    const input = 1672531200000; // Tương ứng với 1/1/2023 UTC
    expect(formatDate(input)).toBe('Sunday, Jan 1, 2023');
  });
});
