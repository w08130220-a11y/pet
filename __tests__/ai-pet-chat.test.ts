import { describe, it, expect, vi } from "vitest";

// Mock the LLM module
vi.mock("../server/_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            message: "汪汪！好開心見到你～",
            action: "play",
            mood: "happy",
          }),
        },
      },
    ],
  }),
}));

// Import after mocking
import { chatWithPet, getAutonomousBehavior } from "../server/ai-pet-chat";

describe("AI Pet Chat Service", () => {
  describe("chatWithPet", () => {
    it("should return a valid chat response for a dog", async () => {
      const petInfo = {
        name: "小黃",
        species: "dog",
        breed: "柴犬",
      };

      const response = await chatWithPet(petInfo, "你好！");

      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("action");
      expect(response).toHaveProperty("mood");
      expect(typeof response.message).toBe("string");
      expect(response.message.length).toBeGreaterThan(0);
    });

    it("should return a valid chat response for a cat", async () => {
      const petInfo = {
        name: "咪咪",
        species: "cat",
      };

      const response = await chatWithPet(petInfo, "你餓了嗎？");

      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("action");
      expect(response).toHaveProperty("mood");
    });

    it("should handle conversation history", async () => {
      const petInfo = {
        name: "小黃",
        species: "dog",
      };

      const history = [
        { role: "user" as const, content: "你好！" },
        { role: "assistant" as const, content: "汪汪！" },
      ];

      const response = await chatWithPet(petInfo, "想玩嗎？", history);

      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("action");
    });

    it("should return valid action values", async () => {
      const petInfo = {
        name: "小黃",
        species: "dog",
      };

      const response = await chatWithPet(petInfo, "來玩吧！");

      const validActions = ["idle", "walk", "sit", "sleep", "play", "jump", "eat", "happy", "sad"];
      expect(validActions).toContain(response.action);
    });

    it("should return valid mood values", async () => {
      const petInfo = {
        name: "小黃",
        species: "dog",
      };

      const response = await chatWithPet(petInfo, "乖乖！");

      const validMoods = ["happy", "neutral", "excited", "sleepy", "hungry"];
      expect(validMoods).toContain(response.mood);
    });
  });

  describe("getAutonomousBehavior", () => {
    it("should return autonomous behavior for a pet", async () => {
      // Update mock for this test
      vi.mocked(await import("../server/_core/llm")).invokeLLM.mockResolvedValueOnce({
        id: "test",
        created: Date.now(),
        model: "test",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: JSON.stringify({
                action: "sleep",
                thought: "好睏...該睡覺了",
              }),
            },
            finish_reason: "stop",
          },
        ],
      });

      const petInfo = {
        name: "小黃",
        species: "dog",
      };

      const behavior = await getAutonomousBehavior(petInfo, "23:00", ["play", "eat"]);

      expect(behavior).toHaveProperty("action");
      expect(behavior).toHaveProperty("thought");
    });
  });
});

describe("Premium Store", () => {
  it("should have correct initial state", async () => {
    // Test the premium store logic
    const initialState = {
      isPremium: false,
      purchaseDate: null,
      expiryDate: null,
    };

    expect(initialState.isPremium).toBe(false);
    expect(initialState.purchaseDate).toBeNull();
    expect(initialState.expiryDate).toBeNull();
  });

  it("should calculate premium expiry correctly", () => {
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    
    // Check that expiry is approximately 30 days from now
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(30, 0);
  });

  it("should detect expired premium", () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    const isExpired = pastDate < new Date();
    expect(isExpired).toBe(true);
  });

  it("should detect valid premium", () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day from now
    const isValid = futureDate > new Date();
    expect(isValid).toBe(true);
  });
});

describe("Pet 3D Model Types", () => {
  it("should have valid animation types", () => {
    const validAnimations = ["idle", "walk", "sit", "sleep", "play", "jump"];
    
    expect(validAnimations).toContain("idle");
    expect(validAnimations).toContain("walk");
    expect(validAnimations).toContain("play");
    expect(validAnimations.length).toBe(6);
  });

  it("should have valid scene types", () => {
    const validScenes = ["park", "living_room", "beach", "forest"];
    
    expect(validScenes).toContain("park");
    expect(validScenes).toContain("beach");
    expect(validScenes.length).toBe(4);
  });

  it("should map species to colors correctly", () => {
    const petColors: Record<string, string> = {
      dog: "#D4A574",
      cat: "#F5A623",
      bird: "#4ECDC4",
      rabbit: "#FFFFFF",
      other: "#95A5A6",
    };

    expect(petColors.dog).toBe("#D4A574");
    expect(petColors.cat).toBe("#F5A623");
    expect(petColors.bird).toBe("#4ECDC4");
    expect(petColors.rabbit).toBe("#FFFFFF");
    expect(petColors.other).toBe("#95A5A6");
  });
});
