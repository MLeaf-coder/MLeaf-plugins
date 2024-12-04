import kfc from "./kfc/kfc.js";
import ppx from "./ppx/ppx.js";
import help from "./help/help.js";
import log from "#logger";
import { NewMessage } from "telegram/events/index.js";

export const Notes = {
  ppx: {
    usage: "/ppx",
    description: "解析皮皮虾视频",
  },
  kfc: {
    usage: "/kfc",
    description: "解析皮皮虾视频",
  },
  help: {
    usage: "/help",
    description: "解析皮皮虾视频",
  },
};
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
      if (cmd === "/ppx") {
        await ppx(client, event);
      } else if (cmd === "/kfc") {
        await kfc(client, event);
      } else if (cmd === "/help") {
        await help(client, event);
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
