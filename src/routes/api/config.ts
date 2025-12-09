import { Context } from "hono";

export const Config = async (c: Context) => {
  const anamApiKey = c.env.ANAM_API_KEY;
  const avatarId = c.env.ANAM_AVATAR_ID;
  const elevenLabsAgentId = c.env.ELEVENLABS_AGENT_ID;

  if (!anamApiKey || !avatarId || !elevenLabsAgentId) {
    return c.json(
      {
        error:
          "Missing environment variables. Check ANAM_API_KEY, ANAM_AVATAR_ID, and ELEVENLABS_AGENT_ID",
      },
      500
    );
  }

  try {
    const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anamApiKey}`,
      },
      body: JSON.stringify({
        personaConfig: {
          avatarId: avatarId,
          avatarOnly: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Anam API error:", error);
      return c.json({ error: "Failed to get Anam session token" }, 500);
    }

    const data = await response.json();
    return c.json({
      anamSessionToken: data.sessionToken,
      elevenLabsAgentId: elevenLabsAgentId,
    });
  } catch (error) {
    console.error("Config error:", error);
    return c.json({ error: "Failed to get config" }, 500);
  }
};
