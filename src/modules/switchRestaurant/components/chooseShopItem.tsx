import { MaterialIcons } from "@expo/vector-icons";
import React, { FC, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Surface } from "react-native-paper";
import { IShopData } from "../switchRestaurant.type";
import ShopOptionModal from "./ShopOptionModal";

interface IPropsItem {
  propsItem: IShopData;
  onPressIdShop: (id: any) => any;
  onPressEdit?: (shop: IShopData) => void;
  onPressDelete?: (shop: IShopData) => void;
}

const ChooseShopItem: FC<IPropsItem> = ({
  propsItem,
  onPressIdShop,
  onPressEdit,
  onPressDelete
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  const handleShowOptions = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setModalPosition({ top: pageY, left: pageX });
    setModalVisible(true);
  };

  return (
    <Surface style={styles.container} elevation={2}>
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={() => onPressIdShop(propsItem.id)}
        activeOpacity={0.9}
      >
        <Image
          source={propsItem.shopLogo ? { uri: propsItem.shopLogo } : require('@/assets/images/logo.png')} // Fallback image if needed, or handle in upper layer
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.shopName} numberOfLines={1}>
              {propsItem.shopName}
            </Text>
            <TouchableOpacity onPress={handleShowOptions} hitSlop={10}>
              <MaterialIcons name="more-vert" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={16} color="#FBBF24" />
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.reviewText}>(10+ Reviews)</Text>
          </View>

          {/* Optional: Add location or status if available in IShopData */}
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Đang hoạt động</Text>
          </View>
        </View>
      </TouchableOpacity>

      <ShopOptionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onEdit={() => {
          onPressEdit?.(propsItem);
          setModalVisible(false);
        }}
        onDelete={() => {
          onPressDelete?.(propsItem);
          setModalVisible(false);
        }}
        position={modalPosition}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  touchableArea: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 4,
    marginRight: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  }
});

export default ChooseShopItem;
