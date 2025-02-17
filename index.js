import kfc from "./kfc/kfc.js";
import ppx from "./ppx/ppx.js";
import { eventupdate } from "../../core/api/event.js";
import log from "../../core/log.js";

export default async function (client) {
  // 命令处理器映射
  const commands = {
    "/ppx": ppx,
    "/kfc": kfc,
  };

  // 监听命令消息
  eventupdate.on("CommandMessage", async (event) => {
    const message = event.message;
    try {
      const baseCmd = message.message.split(" ")[0]; // 获取命令主体

      if (commands[baseCmd]) {
        try {
          await commands[baseCmd](client, { message });
        } catch (error) {
          log.error(`[MLeaf] 命令执行失败: ${baseCmd}`, error);
        }
      } else {
        log.warn(`[MLeaf] 未识别的命令: ${baseCmd}`);
      }
    } catch (error) {
      log.error("[MLeaf] 命令处理异常:", error);
    }
  });
}
