import kfc from "./kfc/kfc.js";
import ppx from "./ppx/ppx.js";
import { getActiveAI } from "./Gemini/index.js";
import log from "#logger";
import { NewMessage } from "telegram/events/index.js";

export default async function (client) {
  const handler = async (event) => {
    try {
      const message = event.message;
      const messageText = message.message;

      // 基础校验：空消息不处理
      if (!messageText) return;

      // 获取机器人信息
      const me = await client.getMe();

      // 命令处理标记（true表示消息是命令）
      let isCommand = false;

      // 命令处理器映射
      const commands = {
        "/ppx": ppx,
        "/kfc": kfc,
      };

      // 判断是否是命令格式
      if (messageText.startsWith("/")) {
        // 提取命令主体（处理带@username的情况）
        const [baseCmd, targetUsername] = messageText
          .split(" ")[0] // 取第一个单词
          .split("@"); // 分割命令和用户名

        // 验证用户名匹配
        if (
          targetUsername &&
          targetUsername.toLowerCase() !== me.username.toLowerCase()
        ) {
          return; // 不处理@其他机器人的命令
        }

        // 标记为命令消息
        isCommand = true;

        // 执行对应命令处理
        if (commands[baseCmd]) {
          try {
            await commands[baseCmd](client, event);
          } catch (error) {
            log.error(`[MLeaf] 命令执行失败: ${baseCmd}`, error);
          }
        } else {
          log.warn(`[MLeaf] 未识别的命令: ${baseCmd}`);
        }
      }

      // 非命令消息触发AI对话
      if (!isCommand) {
        try {
          const activeAI = getActiveAI();
          if (activeAI) {
            await activeAI(client, event);
          } else {
            log.error("[MLeaf] 未找到激活的AI模型");
          }
        } catch (error) {
          log.error("[MLeaf] AI处理失败:", error);
        }
      }
    } catch (error) {
      log.error("[MLeaf] 消息处理异常:", error);
    }
  };

  client.addEventHandler(handler, new NewMessage({}));

  return {
    handler,
  };
}
