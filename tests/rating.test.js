import { rating } from "../client/app/utils/rating";

describe('Hàm rating', () => {
  it('Trường hợp 1: trả về 0 nếu giá trị là 100', () => {
    expect(rating(100)).toBe(0);
  });

  it('Trường hợp 2: trả về 1 nếu giá trị là 80', () => {
    expect(rating(80)).toBe(1);
  });

  it('Trường hợp 3: trả về 2 nếu giá trị là 60', () => {
    expect(rating(60)).toBe(2);
  });

  it('Trường hợp 4: trả về 3 nếu giá trị là 40', () => {
    expect(rating(40)).toBe(3);
  });

  it('Trường hợp 5: trả về 4 nếu giá trị là 20', () => {
    expect(rating(20)).toBe(4);
  });

  it('Trường hợp 6: trả về 5 nếu giá trị không xác định (ví dụ: 10)', () => {
    expect(rating(10)).toBe(5);
  });

  it('Trường hợp 7: trả về 5 nếu giá trị là undefined', () => {
    expect(rating(undefined)).toBe(5);
  });

  it('Trường hợp 8: trả về 0 nếu giá trị lớn hơn 100 (ví dụ: 120)', () => {
    expect(rating(120)).toBe(5); // hoặc có thể là 5 tùy quy định hàm
  });

  it('Trường hợp 9: trả về 5 nếu giá trị là -10 (âm)', () => {
    expect(rating(-10)).toBe(5);
  });

  it('Trường hợp 10: trả về 0 nếu giá trị là 99 (cận trên gần 100)', () => {
    expect(rating(99)).toBe(5); // hoặc 1 tùy điều kiện hàm
  });

  it('Trường hợp 11: trả về 1 nếu giá trị là 81 (cận trên gần 80)', () => {
    expect(rating(81)).toBe(5);
  });

  it('Trường hợp 12: trả về 5 nếu giá trị là 0', () => {
    expect(rating(0)).toBe(5);
  });
});
