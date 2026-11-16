import { Alert, Platform } from 'react-native';

// Cross-platform alert that works on web (RN Web's Alert.alert is a no-op)
export function showAlert(title, message, buttons) {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (buttons && buttons.length > 1) {
      const okBtn = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];
      if (window.confirm(text)) {
        okBtn?.onPress?.();
      } else {
        buttons.find(b => b.style === 'cancel')?.onPress?.();
      }
    } else {
      window.alert(text);
      buttons?.[0]?.onPress?.();
    }
    return;
  }
  Alert.alert(title, message, buttons);
}
