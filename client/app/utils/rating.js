export const rating = v => {
    switch (v) {
      case 100:
        return 0;
      case 80:
        return 1;
      case 60:
        return 2;
      case 40:
        return 3;
      case 20:
        return 4;
      default:
        return 5;
    }
  };