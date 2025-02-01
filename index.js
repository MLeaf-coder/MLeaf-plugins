import kfc from "./kfc/kfc.js";
import ppx from "./ppx/ppx.js";
import { getActiveAI } from "./Gemini/index.js";
import log from "#logger";
import { NewMessage } from "telegram/events/index.js";

export default async function (client) {
  // 定义一个处理器函数
  const handler = async (event) => {
    try {
      // 把获取的消息赋值给message
      const message = event.message;
      // 判断消息是否以/开头
      const command = message.message.split(" ")[0];
      // 获取机器人的信息
      const me = await client.getMe();

      const [cmd, username] = command.split("@");
      if (username && username.toLowerCase() !== me.username.toLowerCase()) {
        return;
      }
      const commands = {
        "/ppx": ppx,
        "/kfc": kfc,
      };

      let commandHandled = false;

      if (commands[cmd]) {
        await commands[cmd](client, event);
        commandHandled = true;
      }

      if (!commandHandled) {
        // 如果命令未匹配，则交给当前激活的 AI 模型处理
        const activeAI = getActiveAI();
        if (activeAI) {
          await activeAI(client, event);
        } else {
          log.error(`[MLeaf-plugins]未找到激活的 AI 模型`);
        }
      }
    } catch (error) {
      log.error(`[MLeaf-plugins]插件处理消息时出错: ${error}`);
    }
  };

  // 注册处理器
  client.addEventHandler(handler, new NewMessage({}));

  return {
    handler,
  };
}
