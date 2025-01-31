import { GoogleGenerativeAI } from "@google/generative-ai";

// 读取环境变量中的 API Key
const apiKey = process.env.API_KEY || "你的API Key";

// 初始化 Google Generative AI 客户端
const genAI = new GoogleGenerativeAI(apiKey);

async function generateText(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    console.log("API 响应:", response);

    const text = response.text?.();
    if (text) {
      console.log("生成的文本:", text);
      return text; // 返回生成的文本
    } else {
      console.error("No response from model");
      return "抱歉，我无法理解这个请求。";
    }
  } catch (error) {
    console.error("调用 Gemini API 时出错:", error);
    return `发生错误: ${error.message}`;
  }
}

export { generateText }; // 导出生成文本的函数
