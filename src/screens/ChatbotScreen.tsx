import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Animated, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { CHAT_REQUEST_TIMEOUT_MS } from '../config';
import { getBackendUrl } from '../utils/ApiConfig';
import { logActivity } from '../utils/logActivity';

// Keep chatbot working even when native speech module is unavailable (e.g. Expo Go).
let SpeechModule: any = null;
let useSpeechRecognitionEventSafe: any = () => {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const speechPkg = require('expo-speech-recognition');
  SpeechModule = speechPkg.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEventSafe = speechPkg.useSpeechRecognitionEvent;
} catch {
  // no-op: voice will be disabled gracefully
}

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

const MAX_CHAT_HISTORY_MESSAGES = 8;

function isAbortError(e: unknown): boolean {
  return Boolean(e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'AbortError');
}

type Props = {
  language: string;
  onBackHome: () => void;
};

const AnimatedMessage = ({ msg }: { msg: Message }) => {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = msg.sender === 'user';

  return (
    <Animated.View style={[
      styles.msgContainer,
      isUser ? styles.msgUser : styles.msgBot,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <Text style={[styles.msgText, isUser ? styles.msgTextUser : styles.msgTextBot]}>{msg.text}</Text>
    </Animated.View>
  );
};

export const ChatbotScreen = ({ language, onBackHome }: Props) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('chatbot.welcome', 'Hello! I am your Krishi AI Assistant. Ask me any farming related question!'), sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Track chatbot session start
  useEffect(() => {
    void logActivity('CHATBOT', 'Started a Krishi AI chatbot session');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useSpeechRecognitionEventSafe('start', () => setIsListening(true));
  useSpeechRecognitionEventSafe('end', () => setIsListening(false));
  useSpeechRecognitionEventSafe('result', (event: any) => {
    const text = event.results?.[0]?.transcript?.trim();
    if (text) setInputText(text);
  });
  useSpeechRecognitionEventSafe('error', (event: any) => {
    setIsListening(false);
    setVoiceError(event.message || 'Voice input error');
  });

  const speechLang = language === 'mr' ? 'mr-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';

  const handleVoiceToggle = async () => {
    setVoiceError('');
    try {
      if (!SpeechModule) {
        setVoiceError('Voice command is unavailable in Expo Go. Use development build for mic feature.');
        return;
      }

      if (isListening) {
        SpeechModule.stop();
        return;
      }

      const available = SpeechModule.isRecognitionAvailable();
      if (!available) {
        setVoiceError('Voice recognition not available on this device.');
        return;
      }

      const perm = await SpeechModule.requestPermissionsAsync();
      if (!perm.granted) {
        setVoiceError('Microphone permission not granted.');
        return;
      }

      SpeechModule.start({
        lang: speechLang,
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
      });
    } catch (e: any) {
      setIsListening(false);
      setVoiceError(String(e?.message || 'Unable to start voice input.'));
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: inputText.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Format history for Gemini API, skipping the first welcome message if it's from the bot
    // since Gemini expects the very first message in history to drop from a user.
    const history = messages
      .filter((m, i) => !(i === 0 && m.sender === 'bot'))
      .slice(-MAX_CHAT_HISTORY_MESSAGES)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);
      const backendUrl = await getBackendUrl();
      const res = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, history }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { id: Date.now().toString(), text: data.response, sender: 'bot' }]);
      } else {
        const serverMessage =
          typeof data?.message === 'string' ? data.message :
          typeof data?.error === 'string' ? data.error :
          'Sorry, I encountered an error. Please try again.';
        setMessages(prev => [...prev, { id: Date.now().toString(), text: serverMessage, sender: 'bot' }]);
      }
    } catch (e: unknown) {
      const timeoutMsg = 'Chat is taking too long. Please try once again with a shorter question.';
      const fallback = 'Network error. Please try again.';
      setMessages(prev => [...prev, { id: Date.now().toString(), text: isAbortError(e) ? timeoutMsg : fallback, sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackHome}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{t('chatbot.title', 'Krishi Chatbot')}</Text>
          <Text style={styles.headerSubTitle}>Fast farming help</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(m => <AnimatedMessage key={m.id} msg={m} />)}
          
          {isLoading && (
            <View style={[styles.msgContainer, styles.msgBot]}>
               <ActivityIndicator size="small" color="#16a34a" />
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity
            style={[styles.micBtn, isListening ? styles.micBtnActive : null]}
            onPress={handleVoiceToggle}
            disabled={isLoading}
          >
            <Text style={styles.micBtnText}>{isListening ? '◼' : '🎤'}</Text>
          </TouchableOpacity>

          <TextInput 
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chatbot.placeholder', 'Ask a farming question...')}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={400}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (isLoading || !inputText.trim()) ? styles.sendBtnDisabled : null]}
            onPress={sendMessage}
            disabled={isLoading || !inputText.trim()}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>

        {(isListening || voiceError) ? (
          <View style={styles.voiceStatusBox}>
            <Text style={styles.voiceStatusText}>
              {voiceError ? voiceError : 'Listening... speak now'}
            </Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontSize: 24, color: '#14532d' },
  headerTextWrap: { marginLeft: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#14532d' },
  headerSubTitle: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 2 },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  msgContainer: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  msgUser: { alignSelf: 'flex-end', backgroundColor: '#16a34a', borderBottomRightRadius: 4 },
  msgBot: { alignSelf: 'flex-start', backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 16, lineHeight: 22 },
  msgTextUser: { color: 'white' },
  msgTextBot: { color: '#1f2937' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  micBtnActive: {
    backgroundColor: '#ef4444',
  },
  micBtnText: { fontSize: 18, color: '#111827' },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1f2937',
    maxHeight: 110,
  },
  sendBtn: {
    marginLeft: 12,
    width: 48,
    height: 48,
    backgroundColor: '#16a34a',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.55 },
  sendBtnText: { color: 'white', fontSize: 20 },
  voiceStatusBox: {
    backgroundColor: '#ecfeff',
    borderTopWidth: 1,
    borderTopColor: '#cffafe',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  voiceStatusText: { color: '#0f766e', fontWeight: '700' },
});
