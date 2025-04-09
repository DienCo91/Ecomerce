import { formatTime } from '../client/app/utils/date';

describe('Hàm formatTime', () => {
  it('Trường Hợp 1: định dạng đúng với chuỗi ISO date', () => {
    const input = '2025-04-08T10:30:00Z';
    const date = new Date(input);
  
    const expected = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  
    const result = formatTime(input);
    // So sánh kết quả với chuỗi thời gian được format sẵn theo locale
    expect(result).toBe(expected);
  });

  it('Trường Hợp 2: định dạng đúng khi truyền vào đối tượng Date', () => {
    const result = formatTime(new Date('2025-04-08T15:45:00'));
    
    // Kiểm tra chuỗi kết quả có định dạng giờ:phút, ví dụ '15:45' hoặc '3:45 PM'
    // Regex \d{1,2}:\d{2} nghĩa là 1-2 chữ số (giờ) + dấu ":" + 2 chữ số (phút)
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('Trường Hợp 3: hỗ trợ định dạng với chuỗi có timezone offset', () => {
    const result = formatTime('2025-04-08T23:59:00+07:00');

    // Tương tự: kiểm tra chuỗi kết quả có chứa giờ:phút đúng định dạng
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('Trường Hợp 4: trả về "Invalid Date" nếu truyền chuỗi không hợp lệ', () => {
    const result = formatTime('not-a-real-date');

    // Với input không hợp lệ, hàm phải trả về chuỗi 'Invalid Date'
    expect(result).toBe('Invalid Date');
  });

  it('Trường Hợp 5: trả về "Invalid Date" nếu truyền vào null', () => {
    const result = formatTime(null);
    expect(result).toBe('Invalid Date');
  });

  it('Trường Hợp 6: trả về "Invalid Date" nếu truyền vào undefined', () => {
    const result = formatTime(undefined);
    expect(result).toBe('Invalid Date');
  });

  it('Trường Hợp 7: định dạng đúng 12:00 UTC', () => {
    const dateUTC = new Date(Date.UTC(2025, 3, 8, 12, 0)); // 2025-04-08 12:00:00 UTC
    const result = formatTime(dateUTC);

    // Kỳ vọng kết quả là '12:00 PM', nhưng có thể thay đổi tùy vào hệ thống locale
    expect(result).toBe('12:00 PM');
  });

});
