const MANYCHAT_API = "https://api.manychat.com";

function apiKey(): string {
  const k = process.env.MANYCHAT_API_KEY;
  if (!k) throw new Error("Missing MANYCHAT_API_KEY");
  return k;
}

async function mcFetch<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${MANYCHAT_API}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`ManyChat ${path} HTTP ${res.status}: ${text}`);
  }
  return json as T;
}

export type ManyChatSubscriber = {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  gender?: string;
  locale?: string;
  timezone?: string;
  last_interaction?: string;
  custom_fields?: Array<{ id: number; name: string; value: unknown }>;
  tags?: Array<{ id: number; name: string }>;
};

export type ManyChatResponse<T = unknown> = {
  status: "success" | "error";
  data?: T;
  message?: string;
};

export async function findSubscriberByCustomField(
  fieldId: number,
  value: string,
): Promise<ManyChatSubscriber[]> {
  const res = await mcFetch<ManyChatResponse<ManyChatSubscriber[]>>(
    `/fb/subscriber/findByCustomField?field_id=${fieldId}&field_value=${encodeURIComponent(value)}`,
  );
  return res.data ?? [];
}

export async function getSubscriberInfo(subscriberId: string): Promise<ManyChatSubscriber> {
  const res = await mcFetch<ManyChatResponse<ManyChatSubscriber>>(
    `/fb/subscriber/getInfo?subscriber_id=${encodeURIComponent(subscriberId)}`,
  );
  if (!res.data) throw new Error("Subscriber not found");
  return res.data;
}

export async function addTag(subscriberId: string, tagName: string) {
  return mcFetch<ManyChatResponse>("/fb/subscriber/addTagByName", {
    method: "POST",
    body: { subscriber_id: subscriberId, tag_name: tagName },
  });
}

export async function removeTag(subscriberId: string, tagName: string) {
  return mcFetch<ManyChatResponse>("/fb/subscriber/removeTagByName", {
    method: "POST",
    body: { subscriber_id: subscriberId, tag_name: tagName },
  });
}

export async function setCustomField(subscriberId: string, fieldName: string, value: unknown) {
  return mcFetch<ManyChatResponse>("/fb/subscriber/setCustomFieldByName", {
    method: "POST",
    body: { subscriber_id: subscriberId, field_name: fieldName, field_value: value },
  });
}

export async function sendFlow(subscriberId: string, flowNs: string) {
  return mcFetch<ManyChatResponse>("/fb/sending/sendFlow", {
    method: "POST",
    body: { subscriber_id: subscriberId, flow_ns: flowNs },
  });
}

export type ManyChatContentMessage =
  | { type: "text"; text: string }
  | { type: "image"; url: string }
  | { type: "video"; url: string };

export async function sendContent(
  subscriberId: string,
  messages: ManyChatContentMessage[],
  messageTag:
    | "ACCOUNT_UPDATE"
    | "POST_PURCHASE_UPDATE"
    | "CONFIRMED_EVENT_UPDATE"
    | "" = "",
) {
  return mcFetch<ManyChatResponse>("/fb/sending/sendContent", {
    method: "POST",
    body: {
      subscriber_id: subscriberId,
      data: { version: "v2", content: { messages, actions: [], quick_replies: [] } },
      ...(messageTag ? { message_tag: messageTag } : {}),
    },
  });
}

export async function createSubscriber(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  gender?: string;
  has_opt_in_sms?: boolean;
  has_opt_in_email?: boolean;
  consent_phrase?: string;
}): Promise<ManyChatSubscriber> {
  const res = await mcFetch<ManyChatResponse<ManyChatSubscriber>>(
    "/fb/subscriber/createSubscriber",
    { method: "POST", body: data },
  );
  if (!res.data) throw new Error("createSubscriber failed");
  return res.data;
}
