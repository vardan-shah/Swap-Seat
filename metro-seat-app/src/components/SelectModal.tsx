import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';

interface SelectItem {
  label: string;
  value: string;
}

interface SelectModalProps {
  label: string;
  items: SelectItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function SelectModal({
  label,
  items,
  selectedValue,
  onSelect,
  placeholder = 'Select...',
}: SelectModalProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((i) => i.value === selectedValue);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
        <Text style={selectedItem ? styles.selectedText : styles.placeholderText}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.itemBtn, selectedValue === item.value && styles.itemBtnActive]}
                onPress={() => {
                  onSelect(item.value);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[styles.itemText, selectedValue === item.value && styles.itemTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  selector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#fff',
  },
  placeholderText: { color: '#888', fontSize: 16 },
  selectedText: { color: '#333', fontSize: 16 },
  modalContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: {},
  closeBtnText: { color: '#0056b3', fontSize: 16, fontWeight: 'bold' },
  itemBtn: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  itemBtnActive: { backgroundColor: '#e6f2ff' },
  itemText: { fontSize: 16, color: '#333' },
  itemTextActive: { color: '#0056b3', fontWeight: 'bold' },
});
