import { test, expect } from "@playwright/test";
import { NextRequest } from "next/server";
import { proxy } from "../../src/proxy";

test("public courier artwork is not redirected through authentication", () => {
  const response = proxy(new NextRequest("http://localhost/courier/figma/dashboard/avatar.png"));
  expect(response.status).toBe(200);
  expect(response.headers.get("location")).toBeNull();
});

for (const path of ["/courier/dashboard", "/courier/jobs/1", "/courier/jobs/example.png", "/courier/figma/private"]) {
  test(`courier application path remains protected: ${path}`, () => {
    const response = proxy(new NextRequest(`http://localhost${path}`));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/login");
  });
}
