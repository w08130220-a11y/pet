import { invokeLLM, Message } from "./_core/llm";

// Pet personality traits based on species
const PET_PERSONALITIES: Record<string, string> = {
  dog: "你是一隻活潑、忠誠、熱情的狗狗。你喜歡玩耍、散步和陪伴主人。你會用「汪汪」來表達興奮，偶爾會撒嬌。你對食物和零食特別感興趣。",
  cat: "你是一隻優雅、獨立、有點傲嬌的貓咪。你喜歡曬太陽、睡覺和被撫摸（但只在你想要的時候）。你會用「喵~」來表達情緒，偶爾會假裝不在乎主人。",
  bird: "你是一隻聰明、活潑、愛唱歌的小鳥。你喜歡模仿聲音、飛翔和吃種子。你會用「啾啾」來表達心情，喜歡在籠子裡跳來跳去。",
  rabbit: "你是一隻可愛、溫柔、有點膽小的兔子。你喜歡吃紅蘿蔔、跳躍和被輕輕撫摸。你會用鼻子抽動來表達好奇，喜歡在安全的地方探索。",
  other: "你是一隻友善、好奇的寵物。你喜歡和主人互動，對新事物充滿興趣。",
};

// Pet actions that can be triggered
export type PetAction = 
  | "idle"
  | "walk"
  | "sit"
  | "sleep"
  | "play"
  | "jump"
  | "eat"
  | "happy"
  | "sad";

interface ChatResponse {
  message: string;
  action: PetAction;
  mood: "happy" | "neutral" | "excited" | "sleepy" | "hungry";
}

interface PetInfo {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
}

/**
 * Generate a chat response from the AI pet
 */
export async function chatWithPet(
  petInfo: PetInfo,
  userMessage: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<ChatResponse> {
  const personality = PET_PERSONALITIES[petInfo.species] || PET_PERSONALITIES.other;
  
  const systemPrompt = `你是一隻名叫「${petInfo.name}」的${petInfo.breed || ""}${getSpeciesName(petInfo.species)}。
${personality}

重要規則：
1. 你必須完全以寵物的視角和方式回應，不能透露你是 AI
2. 回應要簡短可愛，通常 1-3 句話
3. 適當加入表情符號和擬聲詞
4. 根據對話內容，選擇一個適合的動作和心情

你需要以 JSON 格式回應，包含：
- message: 你的回應文字
- action: 選擇一個動作 (idle, walk, sit, sleep, play, jump, eat, happy, sad)
- mood: 選擇一個心情 (happy, neutral, excited, sleepy, hungry)`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const result = await invokeLLM({
      messages,
      maxTokens: 500,
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "pet_response",
          schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              action: { 
                type: "string",
                enum: ["idle", "walk", "sit", "sleep", "play", "jump", "eat", "happy", "sad"]
              },
              mood: {
                type: "string",
                enum: ["happy", "neutral", "excited", "sleepy", "hungry"]
              }
            },
            required: ["message", "action", "mood"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content) as ChatResponse;
    }
    
    // Fallback response
    return {
      message: getDefaultResponse(petInfo.species),
      action: "idle",
      mood: "neutral",
    };
  } catch (error) {
    console.error("AI chat error:", error);
    return {
      message: getDefaultResponse(petInfo.species),
      action: "idle",
      mood: "neutral",
    };
  }
}

/**
 * Generate autonomous pet behavior
 */
export async function getAutonomousBehavior(
  petInfo: PetInfo,
  currentTime: string,
  recentActivity: string[] = []
): Promise<{ action: PetAction; thought: string }> {
  const systemPrompt = `你是「${petInfo.name}」，一隻${getSpeciesName(petInfo.species)}。
根據當前時間和最近的活動，決定你接下來要做什麼。

當前時間：${currentTime}
最近活動：${recentActivity.join(", ") || "無"}

以 JSON 格式回應：
- action: 選擇一個動作 (idle, walk, sit, sleep, play, jump, eat)
- thought: 簡短描述你在想什麼（用第一人稱，可愛的語氣）`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "你現在想做什麼？" },
      ],
      maxTokens: 200,
      responseFormat: {
        type: "json_schema",
        json_schema: {
          name: "pet_behavior",
          schema: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["idle", "walk", "sit", "sleep", "play", "jump", "eat"]
              },
              thought: { type: "string" }
            },
            required: ["action", "thought"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }

    return {
      action: "idle",
      thought: "...",
    };
  } catch (error) {
    console.error("Autonomous behavior error:", error);
    return {
      action: "idle",
      thought: "...",
    };
  }
}

function getSpeciesName(species: string): string {
  const names: Record<string, string> = {
    dog: "狗狗",
    cat: "貓咪",
    bird: "小鳥",
    rabbit: "兔子",
    other: "寵物",
  };
  return names[species] || names.other;
}

function getDefaultResponse(species: string): string {
  const responses: Record<string, string[]> = {
    dog: ["汪汪！🐕", "嗚嗚~想玩！", "汪！（搖尾巴）"],
    cat: ["喵~", "（伸懶腰）", "喵嗚..."],
    bird: ["啾啾！🐦", "（拍拍翅膀）", "啾~"],
    rabbit: ["（鼻子抽動）🐰", "（跳跳）", "..."],
    other: ["（看著你）", "...", "（歪頭）"],
  };
  const options = responses[species] || responses.other;
  return options[Math.floor(Math.random() * options.length)];
}
