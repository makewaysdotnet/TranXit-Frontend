import { test, expect } from "@playwright/test";
import { createRefreshCoordinator } from "../../src/lib/auth-refresh-coordinator";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test("overlapping automatic and explicit renewals share one rotation", async () => {
  const coordinate = createRefreshCoordinator<string>();
  const backend = deferred<string>();
  let rotations = 0;
  const rotate = () => { rotations++; return backend.promise; };
  const requests = Array.from({ length: 20 }, () => coordinate("opaque-session-a", rotate));
  await Promise.resolve();
  expect(rotations).toBe(1);
  backend.resolve("new-credential");
  expect(await Promise.all(requests)).toEqual(Array(20).fill("new-credential"));
});

test("separate credentials cannot receive another session's result", async () => {
  const coordinate = createRefreshCoordinator<string>();
  const first = deferred<string>();
  const second = deferred<string>();
  const a = coordinate("session-a", () => first.promise);
  const b = coordinate("session-b", () => second.promise);
  second.resolve("b-result"); first.resolve("a-result");
  expect(await Promise.all([a, b])).toEqual(["a-result", "b-result"]);
});

test("completed credential is not cached and a replay reaches the backend", async () => {
  const coordinate = createRefreshCoordinator<string>();
  let rotations = 0;
  const rotate = async () => ++rotations === 1 ? "rotated" : "reuse-rejected";
  expect(await coordinate("old-credential", rotate)).toBe("rotated");
  expect(await coordinate("old-credential", rotate)).toBe("reuse-rejected");
  expect(rotations).toBe(2);
});

test("backend rejection is shared then cleared for recovery", async () => {
  const coordinate = createRefreshCoordinator<string>();
  const backend = deferred<string>();
  const first = coordinate("session", () => backend.promise);
  const second = coordinate("session", () => backend.promise);
  backend.reject(new Error("network unavailable"));
  const results = await Promise.allSettled([first, second]);
  expect(results.every((result) => result.status === "rejected")).toBe(true);
  expect(await coordinate("session", async () => "retry")).toBe("retry");
});

test("synchronous adapter failure does not strand a coordinator entry", async () => {
  const coordinate = createRefreshCoordinator<string>();
  await expect(coordinate("session", () => { throw new Error("adapter failed"); })).rejects.toThrow("adapter failed");
  expect(await coordinate("session", async () => "retry")).toBe("retry");
});

test("in-flight capacity is bounded without evicting a pending session", async () => {
  const coordinate = createRefreshCoordinator<string>(1);
  const backend = deferred<string>();
  const first = coordinate("session-a", () => backend.promise);
  const same = coordinate("session-a", async () => "must-not-rotate-twice");
  await expect(coordinate("session-b", async () => "b")).rejects.toThrow("renewal is busy");
  backend.resolve("a");
  expect(await Promise.all([first, same])).toEqual(["a", "a"]);
  expect(await coordinate("session-b", async () => "b")).toBe("b");
});
