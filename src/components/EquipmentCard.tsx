import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Equipment } from '../data/agriShareData';

interface Props {
  equipment: Equipment;
  onPress: () => void;
  isAdmin?: boolean;
  onDelete?: (equipmentId: string) => void;
  onEdit?: (equipmentId: string) => void;
}

export function EquipmentCard({ equipment, onPress, isAdmin, onDelete, onEdit }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardMain} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: equipment.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {equipment.nameKey ? t(equipment.nameKey) : equipment.rawName}
            </Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{t(equipment.typeKey)}</Text>
            </View>
          </View>

          <Text style={styles.price}>
            ₹{equipment.pricePerDay} <Text style={styles.perDay}>{t('agriShare.perDay')}</Text>
          </Text>

          <View style={styles.footer}>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{Math.round(equipment.distanceKm)} km • {equipment.locationName}</Text>
            </View>
            <View style={styles.rentButton}>
              <Text style={styles.rentButtonText}>{t('agriShare.viewDetails')}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {isAdmin && onEdit && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEdit(equipment.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      )}

      {isAdmin && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(equipment.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  cardMain: { flex: 1 },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#16a34a',
    marginBottom: 12,
  },
  perDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  rentButton: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  rentButtonText: {
    color: '#15803d',
    fontWeight: '800',
    fontSize: 13,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },

  editButton: {
    position: 'absolute',
    top: 10,
    right: 70,
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '900',
    fontSize: 12,
  },
});
