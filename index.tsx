import { Text, View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { Post } from "@/types";

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-TW");
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const colors = useColors();

  const handleLike = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLike(post.id);
  };

  return (
    <View className="bg-surface rounded-2xl mb-4 overflow-hidden border border-border">
      {/* Header */}
      <View className="flex-row items-center p-3">
        <View className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
          {post.petPhotoUri ? (
            <Image source={{ uri: post.petPhotoUri }} style={{ width: 40, height: 40 }} />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <IconSymbol name="pawprint.fill" size={20} color={colors.primary} />
            </View>
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-foreground font-semibold text-base">{post.petName}</Text>
          <Text className="text-muted text-xs">{formatTimeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {/* Image */}
      <Image
        source={{ uri: post.imageUri }}
        style={{ width: "100%", aspectRatio: 1 }}
        contentFit="cover"
      />

      {/* Actions */}
      <View className="flex-row items-center px-3 py-2 gap-4">
        <TouchableOpacity
          onPress={handleLike}
          className="flex-row items-center"
          activeOpacity={0.7}
        >
          <IconSymbol
            name={post.isLiked ? "heart.fill" : "heart"}
            size={24}
            color={post.isLiked ? colors.error : colors.foreground}
          />
          <Text className="text-foreground ml-1">{post.likes}</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <IconSymbol name="bubble.left" size={22} color={colors.foreground} />
          <Text className="text-foreground ml-1">{post.comments}</Text>
        </View>
      </View>

      {/* Caption */}
      {post.caption ? (
        <View className="px-3 pb-3">
          <Text className="text-foreground">
            <Text className="font-semibold">{post.petName} </Text>
            {post.caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState() {
  const router = useRouter();
  const colors = useColors();
  const { state } = usePetStore();

  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
        <IconSymbol name="pawprint.fill" size={40} color={colors.primary} />
      </View>
      <Text className="text-foreground text-xl font-bold mb-2">歡迎來到 PetLife</Text>
      <Text className="text-muted text-center px-8 mb-6">
        {state.pets.length === 0
          ? "先新增您的寵物，開始分享寵物的精彩生活！"
          : "還沒有任何貼文，快來分享您寵物的可愛瞬間！"}
      </Text>
      <TouchableOpacity
        onPress={() => router.push(state.pets.length === 0 ? "/add-pet" : "/create-post")}
        className="bg-primary px-6 py-3 rounded-full"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold">
          {state.pets.length === 0 ? "新增寵物" : "發布貼文"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, toggleLike } = usePetStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCreatePost = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (state.pets.length === 0) {
      router.push("/add-pet");
    } else {
      router.push("/create-post");
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-2xl font-bold text-primary">PetLife</Text>
        <TouchableOpacity onPress={handleCreatePost} activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={state.posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={toggleLike} />}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}
