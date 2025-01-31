import { generateText } from "./api/api.js"; // 引入生成文本的函数

export default async function Gemini(client, event) {
  const msg = event.message;
  const message = msg.message;
  const chatId = event.chatId; // 获取聊天ID，方便后续发送消息
  const user = msg.from; // 获取用户信息

  // 检查是否是普通消息，不是命令（不以 / 开头）
  if (!message.startsWith("/")) {
    // 提取用户消息中的内容
    const userMessage = message.trim();

    if (!userMessage) {
      await client.sendMessage(chatId, {
        message: "请告诉我你想问什么问题。",
      });
      return;
    }

    // 发送“崽崽正在思考怎么回答你...”的提示消息
    const thinkingMsg = await client.sendMessage(chatId, {
      message: "崽崽正在思考怎么回答你...",
    });

    try {
      // 获取用户的名字，如果没有则使用 "用户"
      const userName = user && user.firstName ? user.firstName : "用户";
      const personalizedPrompt = `你好，${userName}！${userMessage}`;

      // 使用生成文本 API 获取回答
      const replyText = await generateText(personalizedPrompt);

      // 更新消息内容，改为回复内容
      await client.editMessage(chatId, {
        message: thinkingMsg.id,
        text: replyText,
      });
    } catch (error) {
      console.error("生成回复失败:", error);
      await client.editMessage(chatId, {
        message: thinkingMsg.id,
        text: "抱歉，崽崽无法回答这个问题。",
      });
    }
  }
}
