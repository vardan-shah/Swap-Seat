import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppStore } from '../../store/mockStore';
import { translations, Language } from '../../i18n';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const login = useAppStore(state => state.login);
  const lang = useAppStore(state => state.language);
  const setLang = useAppStore(state => state.setLanguage);
  
  const t = translations[lang];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.langContainer}>
        <TouchableOpacity onPress={() => setLang('en')} style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>
          <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLang('hi')} style={[styles.langBtn, lang === 'hi' && styles.langBtnActive]}>
          <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>हिन्दी</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLang('gu')} style={[styles.langBtn, lang === 'gu' && styles.langBtnActive]}>
          <Text style={[styles.langText, lang === 'gu' && styles.langTextActive]}>ગુજરાતી</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t.welcome}</Text>
        <Text style={styles.subtitle}>{t.login}</Text>
        
        <Text style={styles.label}>{t.phone}</Text>
        <TextInput
          style={styles.input}
          placeholder={t.enterPhone}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />
        
        <TouchableOpacity 
          style={[styles.btn, phone.length === 10 ? styles.btnActive : styles.btnDisabled]}
          disabled={phone.length < 10}
          onPress={() => login(phone)}
        >
          <Text style={styles.btnText}>{t.continue}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  langContainer: { flexDirection: 'row', justifyContent: 'center', padding: 20, gap: 10 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
  langBtnActive: { backgroundColor: '#FF8200', borderColor: '#FF8200' },
  langText: { color: '#666', fontSize: 14 },
  langTextActive: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0056b3', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 30 },
  btn: { padding: 18, borderRadius: 10, alignItems: 'center' },
  btnActive: { backgroundColor: '#28a745' },
  btnDisabled: { backgroundColor: '#a5d6a7' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
