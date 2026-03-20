import { describe, it, expect } from "vitest";
import { calculateScores } from "./scoring";

describe("Scoring Logic - calculateScores()", () => {
  describe("Unique vs Shared Words", () => {
    it("should award 10 points for unique words", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France", Food: "Pasta" },
        player2: { Name: "Bob", Country: "Germany", Food: "Pizza" },
      };

      const scores = calculateScores(playerAnswers, "player2");

      // player1: 3 unique words (Alice, France, Pasta) = 30 points
      expect(scores.player1).toBe(30);
      // player2: 3 unique words (Bob, Germany, Pizza) + 3 speed bonus = 33 points
      expect(scores.player2).toBe(33);
    });

    it("should award 5 points for shared words", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France", Food: "Pizza" },
        player2: { Name: "Alice", Country: "France", Food: "Pasta" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // player1: 2 shared words (Alice, France) + 1 unique (Pizza) + 3 speed bonus = 2*5 + 10 + 3 = 23 points
      expect(scores.player1).toBe(23);
      // player2: 2 shared words (Alice, France) + 1 unique (Pasta) = 2*5 + 10 = 20 points
      expect(scores.player2).toBe(20);
    });

    it("should handle a mix of unique and shared words", () => {
      const playerAnswers = {
        player1: {
          Name: "Alice",
          Country: "France",
          Food: "Pizza",
          Animal: "Cat",
        },
        player2: {
          Name: "Alice",
          Country: "Germany",
          Food: "Pizza",
          Animal: "Dog",
        },
        player3: {
          Name: "Bob",
          Country: "France",
          Food: "Pasta",
          Animal: "Cat",
        },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // player1: Alice (shared, 5), France (shared, 5), Pizza (shared, 5), Cat (shared, 5) + speed bonus = 20 + 3 = 23
      expect(scores.player1).toBe(23);
      // player2: Alice (shared, 5), Germany (unique, 10), Pizza (shared, 5), Dog (unique, 10) = 30
      expect(scores.player2).toBe(30);
      // player3: Bob (unique, 10), France (shared, 5), Pasta (unique, 10), Cat (shared, 5) = 30
      expect(scores.player3).toBe(30);
    });
  });

  describe("Speed Bonus Application", () => {
    it("should add 3 points to speed bonus winner", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France", Food: "Pizza" },
        player2: { Name: "Bob", Country: "Germany", Food: "Pasta" },
      };

      const scoresWithBonus = calculateScores(playerAnswers, "player1");
      const scoresWithoutBonus = calculateScores(playerAnswers, "player2");

      // player1 should have 3 more points when they're the bonus winner
      expect(scoresWithBonus.player1).toBe(scoresWithoutBonus.player1 + 3);
      expect(scoresWithoutBonus.player2).toBe(scoresWithBonus.player2 + 3);
    });

    it("should only apply bonus to the speed winner", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France" },
        player2: { Name: "Bob", Country: "Germany" },
        player3: { Name: "Charlie", Country: "Spain" },
      };

      const scores = calculateScores(playerAnswers, "player2");

      // Only player2 should have the +3 bonus
      expect(scores.player1).toBe(20); // 2 unique * 10
      expect(scores.player2).toBe(23); // 2 unique * 10 + 3 bonus
      expect(scores.player3).toBe(20); // 2 unique * 10
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty answers", () => {
      const playerAnswers = {
        player1: {},
        player2: { Name: "Bob", Country: "Germany" },
      };

      const scores = calculateScores(playerAnswers, "player2");

      expect(scores.player1).toBe(0);
      expect(scores.player2).toBe(23); // 2 unique + 3 bonus
    });

    it("should handle null/empty string answers", () => {
      const playerAnswers = {
        player1: { Name: "", Country: "France", Food: null },
        player2: { Name: "Alice", Country: "France", Food: "Pizza" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // player1: only France (shared, 5) + speed bonus = 8
      expect(scores.player1).toBe(8);
      // player2: France (shared, 5) + Alice (unique, 10) + Pizza (unique, 10) = 25
      expect(scores.player2).toBe(25);
    });

    it("should handle whitespace-only answers", () => {
      const playerAnswers = {
        player1: { Name: "   ", Country: "France" },
        player2: { Name: "Alice", Country: "France" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // player1: only France (shared, 5) + speed bonus = 8
      expect(scores.player1).toBe(8);
      // player2: Alice (unique, 10) + France (shared, 5) = 15
      expect(scores.player2).toBe(15);
    });

    it("should handle case-insensitive word matching", () => {
      const playerAnswers = {
        player1: { Name: "ALICE", Country: "france" },
        player2: { Name: "alice", Country: "FRANCE" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // Both should have matching shared words despite case differences
      // player1: Alice (shared, 5) + france (shared, 5) + speed bonus = 13
      expect(scores.player1).toBe(13);
      // player2: alice (shared, 5) + FRANCE (shared, 5) = 10
      expect(scores.player2).toBe(10);
    });

    it("should handle missing properties", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France", Food: "Pizza" },
        player2: { Name: "Bob", Food: "Pasta" }, // Missing Country
        player3: null,
      };

      const scores = calculateScores(playerAnswers, "player1");

      // player1: 3 unique + speed bonus = 33
      expect(scores.player1).toBe(33);
      // player2: 2 unique = 20
      expect(scores.player2).toBe(20);
      // player3: null, should be 0
      expect(scores.player3).toBe(0);
    });

    it("should handle single player", () => {
      const playerAnswers = {
        player1: { Name: "Alice", Country: "France", Food: "Pizza" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // All words are unique (no one else to share with) + speed bonus
      expect(scores.player1).toBe(33); // 3 * 10 + 3
    });

    it("should handle all players having empty answers", () => {
      const playerAnswers = {
        player1: { Name: "", Country: "" },
        player2: { Name: null, Country: null },
        player3: {},
      };

      const scores = calculateScores(playerAnswers, "player1");

      expect(scores.player1).toBe(3); // Only speed bonus
      expect(scores.player2).toBe(0);
      expect(scores.player3).toBe(0);
    });

    it("should handle three-way shared word", () => {
      const playerAnswers = {
        player1: { Animal: "Cat", Food: "Pizza" },
        player2: { Animal: "Cat", Food: "Pasta" },
        player3: { Animal: "Cat", Food: "Burger" },
      };

      const scores = calculateScores(playerAnswers, "player1");

      // Each player: Cat (shared among 3, 5 pts) + 1 unique (10 pts)
      // player1: 5 + 10 + speed bonus = 18
      expect(scores.player1).toBe(18);
      // player2: 5 + 10 = 15
      expect(scores.player2).toBe(15);
      // player3: 5 + 10 = 15
      expect(scores.player3).toBe(15);
    });
  });

  describe("Integration Tests", () => {
    it("should calculate real game scenario correctly", () => {
      const playerAnswers = {
        alice: {
          Name: "Alice",
          Country: "France",
          Food: "Croissant",
          Animal: "Cat",
          Brand: "Nike",
        },
        bob: {
          Name: "Bob",
          Country: "Germany",
          Food: "Sauerkraut",
          Animal: "Dog",
          Brand: "Adidas",
        },
        charlie: {
          Name: "Charlie",
          Country: "France",
          Food: "Croissant",
          Animal: "Elephant",
          Brand: "Nike",
        },
      };

      const scores = calculateScores(playerAnswers, "alice");

      // alice: France (shared, 5) + Cat (unique, 10) + 3 others (unique, 30) + bonus = 48
      // Let's trace: Name (unique), Country (shared w/ Charlie), Food (shared w/ Charlie), Animal (unique), Brand (shared w/ Charlie) = 10 + 5 + 5 + 10 + 5 + 3 = 38
      expect(scores.alice).toBe(38);

      // bob: All unique except Country (unique) = 50
      expect(scores.bob).toBe(50);

      // charlie: Name (unique), Country (shared w/ Alice), Food (shared w/ Alice), Animal (unique), Brand (shared w/ Alice) = 10 + 5 + 5 + 10 + 5 = 35
      expect(scores.charlie).toBe(35);
    });
  });
});
