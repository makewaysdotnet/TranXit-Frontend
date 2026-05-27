import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const gatewayUrl =
  process.env.TRANXIT_API_URL ||
  process.env.NEXT_PUBLIC_TRANXIT_API_URL ||
  "http://127.0.0.1:18188";

type ApiResult<T> = {
  isSuccess: boolean;
  value?: T;
  error?: string[];
  errors?: string[];
};

type LoginValue = {
  token: string;
  id: number;
  role: string;
};

type BidValue = {
  bidId: number;
};

type BidListValue = {
  items: Array<{
    bidId: number;
    bidProposalId?: number | null;
    bidProposalIds?: number[];
  }>;
};

type CustomerJob = {
  id?: number;
  jobId?: number;
  jobNumber?: string | null;
  status?: string | null;
};

type CreatedJob = {
  jobId: number;
};

function mailpitConfig() {
  const inbox = process.env.TRANXIT_E2E_MAIL_INBOX?.trim();
  if (!inbox) {
    return null;
  }

  const url = new URL(inbox);
  let username = process.env.TRANXIT_E2E_MAIL_INBOX_USER || decodeURIComponent(url.username);
  let password = process.env.TRANXIT_E2E_MAIL_INBOX_PASSWORD || decodeURIComponent(url.password);
  username = username.trim();
  password = password.trim();

  url.username = "";
  url.password = "";

  if ((username && !password) || (!username && password)) {
    throw new Error("TRANXIT_E2E_MAIL_INBOX_USER and TRANXIT_E2E_MAIL_INBOX_PASSWORD must be set together.");
  }

  const headers: Record<string, string> = {};
  if (username && password) {
    headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }

  return {
    baseUrl: url.toString().replace(/\/$/, ""),
    headers,
  };
}

function collectStrings(value: unknown, strings: string[] = []): string[] {
  if (typeof value === "string") {
    strings.push(value);
    return strings;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, strings));
    return strings;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, strings));
  }

  return strings;
}

function extractOtp(value: unknown) {
  const match = collectStrings(value).join(" ").match(/\b(\d{6})\b/);
  return match?.[1] || "";
}

function firstMailpitMessage(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const messages = record.messages || record.Messages || record.items || record.Items;
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  return messages[0] as Record<string, unknown>;
}

function mailpitMessageId(message: Record<string, unknown> | null) {
  if (!message) {
    return "";
  }

  const candidates = ["ID", "Id", "id", "MessageID", "MessageId", "messageId"];
  for (const key of candidates) {
    const value = message[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

async function fetchMailpitJson(url: string, headers: Record<string, string>) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Mailpit API returned HTTP ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

async function readMailpitOtp(email: string) {
  const config = mailpitConfig();
  if (!config) {
    return "";
  }

  const searchUrl = `${config.baseUrl}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}&limit=1`;
  const search = await fetchMailpitJson(searchUrl, config.headers);
  const searchOtp = extractOtp(search);
  if (searchOtp) {
    return searchOtp;
  }

  const messageId = mailpitMessageId(firstMailpitMessage(search));
  if (!messageId) {
    return "";
  }

  const message = await fetchMailpitJson(
    `${config.baseUrl}/api/v1/message/${encodeURIComponent(messageId)}`,
    config.headers,
  );
  return extractOtp(message);
}

export async function readDevOtpCookie(page: Page, email?: string) {
  if (mailpitConfig()) {
    if (!email) {
      throw new Error("A test email is required when TRANXIT_E2E_MAIL_INBOX is set.");
    }

    let otp = "";
    await expect
      .poll(
        async () => {
          try {
            otp = await readMailpitOtp(email);
          } catch {
            otp = "";
          }
          return otp;
        },
        {
          timeout: 60_000,
          intervals: [1_000, 2_000, 5_000],
        },
      )
      .toMatch(/^\d{6}$/);

    return otp;
  }

  let otp = "";
  await expect
    .poll(async () => {
      const cookies = await page.context().cookies();
      otp = cookies.find((cookie) => cookie.name === "tranxit_dev_verification_code")?.value || "";
      return otp;
    })
    .toMatch(/^\d{6}$/);

  return otp;
}

export async function gatewayLogin(
  request: APIRequestContext,
  email: string,
  password = "Password1!",
) {
  const response = await request.post(`${gatewayUrl}/api/login`, {
    data: { email, password },
  });
  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<LoginValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.token).toBeTruthy();
  return result.value!;
}

export async function seedCourierBid(request: APIRequestContext, jobId: number) {
  const courier = await gatewayLogin(request, "courier@tranxit.local");
  const response = await request.post(`${gatewayUrl}/api/bids`, {
    headers: {
      Authorization: `Bearer ${courier.token}`,
    },
    data: {
      jobId,
      pickupCharges: 110000,
      handlingCharges: 185000,
      customClearanceCharges: 95000,
      isInsurancePolicy: true,
      bidCustomCharges: [
        {
          name: "Ocean freight",
          description: "E2E seeded freight charge",
          amount: 1640000,
        },
      ],
      bidProposals: [
        {
          deliveryTypeId: 1,
          isBaseBid: true,
          deliveryDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
          total: 2030000,
          bidProposalItems: [],
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const result = (await response.json()) as ApiResult<BidValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.bidId).toBeGreaterThan(0);
  return result.value!.bidId;
}

export async function createCustomerJobForCourierBid(request: APIRequestContext) {
  const customer = await gatewayLogin(request, "customer@tranxit.local");
  const recipientStamp = Date.now();
  const response = await request.post(`${gatewayUrl}/api/jobs`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
    data: {
      courierModeId: 1,
      cargoModeId: 1,
      itemTypeId: 1,
      originCountryId: 1,
      destinationCountryId: 2,
      originCityId: 1,
      destinationCityId: 3,
      originAddress: "E2E origin warehouse",
      destinationAddress: "E2E destination depot",
      recipientName: "E2E Recipient",
      recipientEmail: `e2e.recipient.${recipientStamp}@example.com`,
      recipientContact: "+49 40 123456",
      pickupDateUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDateUtc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      jobItems: [
        {
          itemName: "E2E cartons",
          quantity: 8,
          itemTypeId: 1,
          weight: 320,
          declaredValue: 420000,
          dimensions: "120x80x110cm",
          description: "Created by Playwright courier bid flow",
        },
      ],
    },
  });

  expect(response.status()).toBe(201);
  const result = (await response.json()) as ApiResult<CreatedJob>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.jobId).toBeGreaterThan(0);

  const jobsResponse = await request.get(`${gatewayUrl}/api/jobs/${customer.id}`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });
  expect(jobsResponse.ok()).toBeTruthy();
  const jobsResult = (await jobsResponse.json()) as ApiResult<CustomerJob[]>;
  const job = jobsResult.value?.find((item) => (item.jobId ?? item.id) === result.value!.jobId);

  return {
    jobId: result.value!.jobId,
    jobNumber: job?.jobNumber || `Job #${result.value!.jobId}`,
  };
}

export async function expectGatewayBid(request: APIRequestContext, jobId: number) {
  const customer = await gatewayLogin(request, "customer@tranxit.local");
  const response = await request.get(`${gatewayUrl}/api/bids/${jobId}?page=1&pageSize=20`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<BidListValue>;
  expect(result.isSuccess).toBeTruthy();
  expect(result.value?.items.length).toBeGreaterThan(0);
  return result.value!.items[0];
}

export async function expectGatewayJobStatus(
  request: APIRequestContext,
  customerEmail: string,
  jobId: number,
  expectedStatus: string,
) {
  const customer = await gatewayLogin(request, customerEmail);
  const response = await request.get(`${gatewayUrl}/api/jobs/${customer.id}`, {
    headers: {
      Authorization: `Bearer ${customer.token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  const result = (await response.json()) as ApiResult<CustomerJob[]>;
  expect(result.isSuccess).toBeTruthy();
  const job = result.value?.find((item) => (item.jobId ?? item.id) === jobId);
  expect(job).toBeTruthy();
  expect(job!.status).toBe(expectedStatus);
}
