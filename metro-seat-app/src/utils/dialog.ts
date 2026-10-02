import { Alert, Platform } from 'react-native';

export function notify(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return Promise.resolve();
  }
  return new Promise((resolve) =>
    Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], {
      cancelable: true,
      onDismiss: () => resolve(),
    }),
  );
}

export function confirm(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}
