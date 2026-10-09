import { describe, expect, it } from "vitest";
import { UserError } from "./errors.js";
import { parseRepo, parseSince } from "./since.js";

describe("parseSince", () => {
  const now = new Date("2026-03-20T12:00:00.000Z");

  it("parses day/week/hour offsets", () => {
    expect(parseSince("7d", now).toISOString()).toBe("2026-03-13T12:00:00.000Z");
    expect(parseSince("2w", now).toISOString()).toBe("2026-03-06T12:00:00.000Z");
    expect(parseSince("24h", now).toISOString()).toBe("2026-03-19T12:00:00.000Z");
  });

  it("parses ISO dates", () => {
    expect(parseSince("2026-03-01", now).toISOString()).toBe(
      "2026-03-01T00:00:00.000Z",
    );
  });

  it("rejects invalid values", () => {
    expect(() => parseSince("nope", now)).toThrow(UserError);
  });
});

describe("parseRepo", () => {
  it("parses owner/name", () => {
    expect(parseRepo("myorg/api")).toEqual({ owner: "myorg", name: "api" });
  });

  it("rejects invalid repo", () => {
    expect(() => parseRepo("invalid")).toThrow(UserError);
  });
});
