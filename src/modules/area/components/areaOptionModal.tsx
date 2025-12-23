import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AreaOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  position: { top: number; left: number };
}

const AreaOptionsModal: React.FC<AreaOptionsModalProps> = ({
  visible,
  onClose,
  onEdit,
  onDelete,
  position
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.modalContainer,
            {
              top: position.top + 10, // Slight offset for better visibility
              left: position.left - 140 // Shift left to align with the dots
            }
          ]}
        >
          <TouchableOpacity style={styles.modalOption} onPress={onEdit}>
            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="create-outline" size={18} color="#0284C7" />
            </View>
            <Text style={styles.modalOptionText}>Sửa</Text>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.modalOption} onPress={onDelete}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="trash-outline" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.modalOptionText, styles.deleteText]}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.1)', // Optional dimming
  },
  modalContainer: {
    position: 'absolute',
    width: 150,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  deleteText: {
    color: '#DC2626',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  }
});

export default AreaOptionsModal;