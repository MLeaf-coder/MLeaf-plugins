import kfc from "./kfc/kfc.js";
import ppx from "./ppx/ppx.js";
import epic from "./epic/index.js";
import youtube from "./youtube/index.js";
import { eventupdate } from "../../core/api/event.js";
import log from "../../core/log.js";

export default async function (client) {
  // 命令处理器映射
  const commands = {
    "/ppx": ppx,
    "/kfc": kfc,
    "/epic": epic,
    "/youtube": youtube,
  };

  // 监听命令消息
  eventupdate.on("CommandMessage", async (event) => {
    const message = event.message;

    try {
      const command = message.message.split(" ")[0];
      // 检查命令是否存在
      if (commands.hasOwnProperty(command)) {
        // 执行对应的命令处理器
        await commands[command](client, event);
      }
    } catch (error) {
      log.error("[MLeaf] 命令处理异常:", error);
    }
  });
}
