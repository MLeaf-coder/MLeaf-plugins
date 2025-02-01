import OpenAI from "openai";
import fs from "fs";
import yaml from "js-yaml";

// 读取 ai.yaml 配置
function loadConfig() {
  return yaml.load(
    fs.readFileSync("./plugins/MLeaf-plugins/Gemini/ai.yaml", "utf8")
  );
}

// 更新 ai.yaml 配置
function saveConfig(config) {
  fs.writeFileSync(
    "./plugins/MLeaf-plugins/Gemini/ai.yaml",
    yaml.dump(config),
    "utf8"
  );
}

// 获取 Qwen API Key
function getApiKey() {
  const config = loadConfig();
  return config.Qwen;
}

const modelId = "Qwen/Qwen2-1.5B-Instruct-GGUF";
const client = new OpenAI({
  baseURL: "https://ms-fc-0de1f4d5-d488.api-inference.modelscope.cn/v1",
  apiKey: getApiKey(),
});

async function generateText(prompt) {
  try {
    let response = await client.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });

    // 如果返回的是字符串，则先解析为对象
    if (typeof response === "string") {
      response = JSON.parse(response);
    }

    console.log("Qwen API 响应:", JSON.stringify(response, null, 2));

    // 直接提取 choices[0].message.content
    const content = response.choices?.[0]?.message?.content;
    if (content && content.trim().length > 0) {
      return content;
    }

    console.error("API 返回数据异常:", JSON.stringify(response, null, 2));
    return "抱歉，我无法理解这个请求。";
  } catch (error) {
    console.error("调用 Qwen API 时出错:", error);
    return `发生错误: ${error.message}`;
  }
}

export default async function Qwen(client, event) {
  const msg = event.message;
  const chatId = event.chatId;
  const user = msg.from;
  const userMessage = msg.message.trim();

  const userName = user && user.firstName ? user.firstName : "用户";
  const personalizedPrompt = `你好，${userName}！${userMessage}`;

  // 更新调用次数
  const config = loadConfig();
  config.usage = config.usage || {};
  config.usage.Qwen = (config.usage.Qwen || 0) + 1;

  // 超过 1500 次时切换到 Gemini
  if (config.usage.Qwen >= 1500) {
    console.log("Qwen 调用次数已达上限，切换到 Gemini");
    config.state.Qwen = false;
    config.state.Gemini = true;
  }

  saveConfig(config);

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
