import { Platform } from 'react-native';

/**
 * Chỉ chạy trên web: bỏ viền focus mặc định của trình duyệt và nền trắng/xanh nhạt do tự điền (autofill)
 * để ô nhập luôn giữ đúng giao diện ban đầu khi bấm vào hoặc khi trình duyệt gợi ý email/mật khẩu.
 */
if (Platform.OS === 'web' && typeof document !== 'undefined' && !document.getElementById('app-web-styles')) {
  const style = document.createElement('style');
  style.id = 'app-web-styles';
  style.textContent = `
    input, textarea, select { outline: none !important; box-shadow: none !important; }
    input:focus, textarea:focus, input:focus-visible, textarea:focus-visible { outline: none !important; box-shadow: none !important; }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active,
    textarea:-webkit-autofill {
      -webkit-text-fill-color: currentColor !important;
      caret-color: currentColor !important;
      transition: background-color 600000s 0s, color 600000s 0s !important;
    }
  `;
  document.head.appendChild(style);
}

export {};
