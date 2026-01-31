import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { Pet } from "@/types";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
  mood?: string;
  timestamp: Date;
}

interface PetChatModalProps {
  visible: boolean;
  onClose: () => void;
  pet: Pet;
  onActionChange?: (action: string) => void;
}

const QUICK_MESSAGES = [
  "你好！",
  "你餓了嗎？",
  "想玩嗎？",
  "乖乖！",
  "來散步吧！",
  "晚安～",
];

function MessageBubble({ message, pet, colors }: { message: Message; pet: Pet; colors: any }) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.petBubble,
        { backgroundColor: isUser ? colors.primary : colors.surface },
      ]}
    >
      {!isUser && (
        <View style={styles.petAvatar}>
          {pet.photoUri ? (
            <Image source={{ uri: pet.photoUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + "30" }]}>
              <Text style={styles.avatarEmoji}>
                {pet.species === "dog" ? "🐕" : pet.species === "cat" ? "🐱" : pet.species === "bird" ? "🐦" : pet.species === "rabbit" ? "🐰" : "🐾"}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.messageContent}>
        {!isUser && (
          <Text style={[styles.petName, { color: colors.primary }]}>{pet.name}</Text>
        )}
        <Text style={[styles.messageText, { color: isUser ? "#FFFFFF" : colors.foreground }]}>
          {message.content}
        </Text>
        {message.mood && !isUser && (
          <Text style={[styles.moodIndicator, { color: colors.muted }]}>
            心情：{getMoodEmoji(message.mood)}
          </Text>
        )}
      </View>
    </View>
  );
}

function getMoodEmoji(mood: string): string {
  const moods: Record<string, string> = {
    happy: "😊 開心",
    neutral: "😐 平靜",
    excited: "🤩 興奮",
    sleepy: "😴 想睡",
    hungry: "🍖 餓了",
  };
  return moods[mood] || mood;
}

export function PetChatModal({ visible, onClose, pet, onActionChange }: PetChatModalProps) {
  const colors = useColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chatMutation = trpc.petAI.chat.useMutation();

  // Add welcome message when modal opens
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(pet.species, pet.name),
        mood: "happy",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [visible, pet]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Get conversation history (last 10 messages)
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatMutation.mutateAsync({
        petInfo: {
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          weight: pet.weight,
        },
        message: messageText,
        conversationHistory: history,
      });

      // Add pet response
      const petMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message,
        action: response.action,
        mood: response.mood,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, petMessage]);

      // Trigger action change
      if (response.action && onActionChange) {
        onActionChange(response.action);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Chat error:", error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getErrorResponse(pet.species),
        mood: "neutral",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputText("");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                與 {pet.name} 對話
              </Text>
              <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} pet={pet} colors={colors} />
            )}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
          />

          {/* Quick Messages */}
          <View style={styles.quickMessages}>
            <FlatList
              horizontal
              data={QUICK_MESSAGES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.quickButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSend(item)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickButtonText, { color: colors.foreground }]}>{item}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickList}
            />
          </View>

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="輸入訊息..."
              placeholderTextColor={colors.muted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? colors.primary : colors.muted },
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <IconSymbol name="paperplane.fill" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </Modal>
  );
}

function getWelcomeMessage(species: string, name: string): string {
  const messages: Record<string, string> = {
    dog: `汪汪！🐕 我是${name}！好開心見到你～想和我玩嗎？`,
    cat: `喵~ 🐱 我是${name}...（伸懶腰）你來了啊。`,
    bird: `啾啾！🐦 我是${name}！今天天氣真好～`,
    rabbit: `（鼻子抽動）🐰 你好...我是${name}，請多指教。`,
    other: `嗨！我是${name}，很高興認識你！`,
  };
  return messages[species] || messages.other;
}

function getErrorResponse(species: string): string {
  const responses: Record<string, string> = {
    dog: "汪...（歪頭）我聽不太懂，再說一次好嗎？",
    cat: "喵？（假裝沒聽到）",
    bird: "啾？（困惑地拍拍翅膀）",
    rabbit: "（耳朵抖動）...？",
    other: "（困惑地看著你）",
  };
  return responses[species] || responses.other;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  messageList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "85%",
  },
  userBubble: {
    alignSelf: "flex-end",
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  petBubble: {
    alignSelf: "flex-start",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  petAvatar: {
    marginRight: 8,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 20,
  },
  messageContent: {
    flex: 1,
  },
  petName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  moodIndicator: {
    fontSize: 12,
    marginTop: 4,
  },
  quickMessages: {
    paddingVertical: 8,
  },
  quickList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  quickButtonText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PetChatModal;
