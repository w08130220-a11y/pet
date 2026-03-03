import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { useAppStore } from './store';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, type ServiceCategory, type Provider } from './index';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];

function ProviderCard({ provider, onPress }: { provider: Provider; onPress: () => void }) {
  const colors = useColors();
  const categoryLabel = SERVICE_CATEGORY_LABELS[provider.category];
  const priceRange = provider.services.length > 0
    ? `$${Math.min(...provider.services.map((s) => s.price))} - $${Math.max(...provider.services.map((s) => s.price))}`
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground }}>
              {provider.name}
            </Text>
            {provider.isVerified && (
              <View style={{
                marginLeft: 6,
                backgroundColor: colors.primary,
                borderRadius: 4,
                paddingHorizontal: 5,
                paddingVertical: 1,
              }}>
                <Text style={{ fontSize: 10, color: colors.surface, fontWeight: '600' }}>認證</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 6 }}>
            {categoryLabel} · {provider.district}
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted }} numberOfLines={2}>
            {provider.description}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 14, color: '#F5A623', marginRight: 3 }}>★</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
              {provider.rating}
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 2 }}>
              ({provider.reviewCount})
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.secondary, fontWeight: '500' }}>
            {priceRange}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 }}>
        {provider.services.slice(0, 3).map((service) => (
          <View
            key={service.id}
            style={{
              backgroundColor: colors.background,
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 12, color: colors.muted }}>{service.name}</Text>
          </View>
        ))}
        {provider.services.length > 3 && (
          <View style={{ backgroundColor: colors.background, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>+{provider.services.length - 3}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, dispatch, getFilteredProviders } = useAppStore();
  const [showCityFilter, setShowCityFilter] = useState(false);

  const filteredProviders = getFilteredProviders();

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
          BeautyBook
        </Text>
        <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
          找到你附近最好的美容服務
        </Text>

        {/* Search Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 14,
          height: 44,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, color: colors.muted, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="搜尋店家、服務、設計師..."
            placeholderTextColor={colors.muted}
            value={state.searchQuery}
            onChangeText={(text) => dispatch({ type: 'SET_SEARCH', payload: text })}
            style={{
              flex: 1,
              fontSize: 15,
              color: colors.foreground,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any}
          />
          {state.searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => dispatch({ type: 'SET_SEARCH', payload: '' })}>
              <Text style={{ fontSize: 16, color: colors.muted }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* City Filter */}
        <TouchableOpacity
          onPress={() => setShowCityFilter(!showCityFilter)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.muted, marginRight: 4 }}>📍</Text>
          <Text style={{ fontSize: 13, color: state.selectedCity ? colors.foreground : colors.muted, fontWeight: '500' }}>
            {state.selectedCity || '全部地區'}
          </Text>
          <Text style={{ fontSize: 10, color: colors.muted, marginLeft: 4 }}>▼</Text>
        </TouchableOpacity>

        {showCityFilter && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <TouchableOpacity
              onPress={() => { dispatch({ type: 'SET_CITY', payload: null }); setShowCityFilter(false); }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 20,
                backgroundColor: !state.selectedCity ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: !state.selectedCity ? colors.primary : colors.border,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 13, color: !state.selectedCity ? colors.surface : colors.foreground }}>
                全部
              </Text>
            </TouchableOpacity>
            {['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'].map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => { dispatch({ type: 'SET_CITY', payload: city }); setShowCityFilter(false); }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: state.selectedCity === city ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: state.selectedCity === city ? colors.primary : colors.border,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 13, color: state.selectedCity === city ? colors.surface : colors.foreground }}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => dispatch({ type: 'SET_CATEGORY', payload: null })}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: !state.selectedCategory ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: !state.selectedCategory ? colors.primary : colors.border,
              marginRight: 8,
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: !state.selectedCategory ? colors.surface : colors.foreground,
            }}>
              全部
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => dispatch({ type: 'SET_CATEGORY', payload: state.selectedCategory === cat ? null : cat })}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: state.selectedCategory === cat ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: state.selectedCategory === cat ? colors.primary : colors.border,
                marginRight: 8,
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: state.selectedCategory === cat ? colors.surface : colors.foreground,
              }}>
                {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results */}
      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 }}
        ListHeaderComponent={
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
            {filteredProviders.length} 間店家
          </Text>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, color: colors.muted }}>沒有找到符合條件的店家</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProviderCard
            provider={item}
            onPress={() => router.push({ pathname: '/[id]', params: { id: item.id } })}
          />
        )}
      />
    </View>
  );
}
