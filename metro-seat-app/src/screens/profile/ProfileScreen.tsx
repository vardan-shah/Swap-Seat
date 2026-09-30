import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../../store/mockStore';
import { translations } from '../../i18n';

export default function ProfileScreen() {
  const lang = useAppStore(state => state.language);
  const t = translations[lang];
  
  const user = useAppStore(state => state.currentUser);
  const upiId = useAppStore(state => state.upiId);
  const setUpiId = useAppStore(state => state.setUpiId);
  const upiQrUri = useAppStore(state => state.upiQrUri);
  const setUpiQrUri = useAppStore(state => state.setUpiQrUri);
  const logout = useAppStore(state => state.logout);
  const setLanguage = useAppStore(state => state.setLanguage);

  const [tempUpiId, setTempUpiId] = useState(upiId || '');

  const saveUpi = () => {
    setUpiId(tempUpiId);
    Alert.alert('Saved', 'UPI ID updated successfully.');
  };
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUpiQrUri(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.displayName.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.reputation}>{t.trustScore}: {user.reputation}/5.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receive Payments (UPI)</Text>
        
        <Text style={{marginBottom: 5, color: '#666', fontSize: 12}}>Enter UPI ID</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g. name@upi"
          value={tempUpiId}
          onChangeText={setTempUpiId}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.btnPrimary} onPress={saveUpi}>
          <Text style={styles.btnPrimaryText}>Save UPI ID</Text>
        </TouchableOpacity>
        
        <View style={{height: 20}} />
        <Text style={{marginBottom: 10, color: '#666', fontSize: 12, textAlign: 'center'}}>OR</Text>
        
        {upiQrUri ? (
          <View style={styles.qrContainer}>
            <Image source={{ uri: upiQrUri }} style={styles.qrImage} />
            <TouchableOpacity style={styles.btnSecondary} onPress={pickImage}>
              <Text style={styles.btnSecondaryText}>Change QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.btnSecondary} onPress={pickImage}>
            <Text style={styles.btnSecondaryText}>Upload QR Code</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.changeLang}</Text>
        <View style={styles.langRow}>
          <TouchableOpacity onPress={() => setLanguage('en')} style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}>
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLanguage('hi')} style={[styles.langBtn, lang === 'hi' && styles.langBtnActive]}>
            <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>HI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLanguage('gu')} style={[styles.langBtn, lang === 'gu' && styles.langBtnActive]}>
            <Text style={[styles.langText, lang === 'gu' && styles.langTextActive]}>GU</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>{t.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF8200', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  reputation: { fontSize: 16, color: '#666' },
  
  section: { backgroundColor: '#fff', marginTop: 20, padding: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  btnPrimary: { backgroundColor: '#0056b3', padding: 15, borderRadius: 8, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  btnSecondary: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  btnSecondaryText: { color: '#333', fontWeight: '500', fontSize: 14 },
  
  qrContainer: { alignItems: 'center', marginTop: 10 },
  qrImage: { width: 200, height: 200, borderRadius: 8 },
  
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15 },
  
  langRow: { flexDirection: 'row', gap: 15 },
  langBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  langBtnActive: { backgroundColor: '#0056b3', borderColor: '#0056b3' },
  langText: { fontSize: 16, color: '#666', fontWeight: '500' },
  langTextActive: { color: '#fff' },
  
  logoutBtn: { margin: 20, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#dc3545', alignItems: 'center' },
  logoutText: { color: '#dc3545', fontWeight: 'bold', fontSize: 16 }
});
