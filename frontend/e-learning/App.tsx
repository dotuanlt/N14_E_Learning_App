import React from 'react';
import '@/utils/web-styles';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useColorScheme, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppNavigator } from '@/navigation';
import { AppProvider } from '@/store';
import { ChatProvider } from '@/store/ChatContext';
import { AppShell } from '@/components/app-shell';
import { FloatingAssistant } from '@/components/floating-assistant';
import { FeedbackHost } from '@/components/ui/feedback-host';
import { Colors } from '@/theme';

export default function App() {
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ChatProvider>
            <View style={{ flex: 1, backgroundColor: palette.background }}>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <AppShell>
                <AppNavigator />
              </AppShell>
              <FloatingAssistant />
              <FeedbackHost />
            </View>
          </ChatProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
