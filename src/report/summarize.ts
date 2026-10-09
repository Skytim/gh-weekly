import OpenAI from "openai";

const MAX_INPUT_CHARS = 12_000;

export interface SummarizeOptions {
  apiKey: string;
  model: string;
  reportMarkdown: string;
}

export async function summarizeReport(
  options: SummarizeOptions,
): Promise<string> {
  const input =
    options.reportMarkdown.length > MAX_INPUT_CHARS
      ? `${options.reportMarkdown.slice(0, MAX_INPUT_CHARS)}\n\n...(truncated)`
      : options.reportMarkdown;

  const client = new OpenAI({ apiKey: options.apiKey });
  const response = await client.chat.completions.create({
    model: options.model,
    messages: [
      {
        role: "system",
        content:
          "You write concise weekly standup summaries from GitHub activity reports. Use bullet points. Mention shipped work, reviews, and open follow-ups when present.",
      },
      {
        role: "user",
        content: `Summarize this weekly GitHub activity report for a standup:\n\n${input}`,
      },
    ],
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned an empty summary");
  }
  return text;
}
