import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useAppStore } from "../../store/mockStore";
import { translations } from "../../i18n";
import { notify } from "../../utils/dialog";

const DEMO_OTP = process.env.EXPO_PUBLIC_DEMO_MODE === "1" ? "1234" : undefined;

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const login = useAppStore((state) => state.login);
  const lang = useAppStore((state) => state.language);
  const setLang = useAppStore((state) => state.setLanguage);

  const t = translations[lang];

  const handleSendOtp = async () => {
    if (name.trim().length < 2) {
      await notify("Invalid Name", "Please enter your full name.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      await notify(
        "Invalid Phone",
        "Please enter a valid 10-digit Indian phone number.",
      );
      return;
    }
    setOtpSent(true);

    if (DEMO_OTP) {
      await notify(
        "OTP Sent",
        `For this demo, please enter ${DEMO_OTP} as your OTP.`,
      );
    }
  };

  const handleVerifyOtp = async () => {
    if (DEMO_OTP && otp === DEMO_OTP) {
      login(name.trim());
    } else {
      await notify("Invalid OTP", "Please enter the correct OTP.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.langContainer}>
        <TouchableOpacity
          onPress={() => setLang("en")}
          style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
        >
          <Text
            style={[styles.langText, lang === "en" && styles.langTextActive]}
          >
            English
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLang("hi")}
          style={[styles.langBtn, lang === "hi" && styles.langBtnActive]}
        >
          <Text
            style={[styles.langText, lang === "hi" && styles.langTextActive]}
          >
            हिन्दी
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLang("gu")}
          style={[styles.langBtn, lang === "gu" && styles.langBtnActive]}
        >
          <Text
            style={[styles.langText, lang === "gu" && styles.langTextActive]}
          >
            ગુજરાતી
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{t.welcome}</Text>
        <Text style={styles.subtitle}>{t.login}</Text>

        {!otpSent ? (
          <>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />

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
              style={[
                styles.btn,
                phone.length === 10 && name.length >= 2
                  ? styles.btnActive
                  : styles.btnDisabled,
              ]}
              disabled={phone.length < 10 || name.length < 2}
              onPress={handleSendOtp}
            >
              <Text style={styles.btnText}>Send OTP</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 4-digit OTP (1234)"
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={4}
            />

            <TouchableOpacity
              style={[
                styles.btn,
                otp.length === 4 ? styles.btnActive : styles.btnDisabled,
              ]}
              disabled={otp.length < 4}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.btnText}>Verify & Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 20, alignItems: "center" }}
              onPress={() => setOtpSent(false)}
            >
              <Text style={{ color: "#0056b3", fontWeight: "bold" }}>
                Edit Phone Number
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  langContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  langBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  langBtnActive: { backgroundColor: "#FF8200", borderColor: "#FF8200" },
  langText: { color: "#666", fontSize: 14 },
  langTextActive: { color: "#fff", fontWeight: "bold" },
  content: { flex: 1, justifyContent: "center", padding: 30 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 30,
  },
  btn: { padding: 18, borderRadius: 10, alignItems: "center" },
  btnActive: { backgroundColor: "#28a745" },
  btnDisabled: { backgroundColor: "#a5d6a7" },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
