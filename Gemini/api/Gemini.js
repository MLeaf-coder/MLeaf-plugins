import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import yaml from "js-yaml";

// 读取 `ai.yaml`
function loadConfig() {
  return yaml.load(
    fs.readFileSync("./plugins/MLeaf-plugins/Gemini/ai.yaml", "utf8")
  );
}

// 获取 API Key
function getApiKey() {
  const config = loadConfig();
  return config.Gemini;
}

const genAI = new GoogleGenerativeAI(getApiKey());

async function generateText(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    console.log("Gemini API 响应:", JSON.stringify(result, null, 2));

    const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return text;
    }

    console.error("API 返回数据异常:", JSON.stringify(result, null, 2));
    return "抱歉，我无法理解这个请求。";
  } catch (error) {
    console.error("调用 Gemini API 时出错:", error);
    return `发生错误: ${error.message}`;
  }
}

export default async function Gemini(client, event) {
  const msg = event.message;
  const chatId = event.chatId;
  const user = msg.from;
  const userMessage = msg.message.trim();

  const userName = user && user.firstName ? user.firstName : "用户";
  const personalizedPrompt = `你好，${userName}！${userMessage}`;

  const thinkingMsg = await client.sendMessage(chatId, {
    message: "崽崽正在思考怎么回答你...",
  });

  try {
    const replyText = await generateText(personalizedPrompt);
    await client.editMessage(chatId, {
      message: thinkingMsg.id,
      text: replyText,
    });
  } catch (error) {
    await client.editMessage(chatId, {
      message: thinkingMsg.id,
      text: "抱歉，崽崽无法回答这个问题。",
    });
  }
}
