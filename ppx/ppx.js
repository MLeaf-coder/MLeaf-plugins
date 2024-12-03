import { extractVideoUrls } from "./api/ppx.js";

export default async function ppx(client, event) {
  const msg = event.message;
  const message = msg.message;

  if (message.startsWith("/ppx")) {
    // 使用正则表达式提取链接
    const urlMatch = message.match(/https?:\/\/[^\s]+/);
    const url = urlMatch ? urlMatch[0] : null;

    if (!url) {
      await client.sendMessage(event.chatId, {
        message: "请提供支持的视频平台分享链接。",
      });
      return;
    }

    try {
      const getmsg = await client.sendMessage(event.chatId, {
        message: "正在获取视频信息，请稍等...",
      });

      // 提取视频链接
      const videoUrls = await extractVideoUrls(url);

      if (!videoUrls || videoUrls.length === 0) {
        await client.editMessage(getmsg.chatId, {
          message: getmsg.id,
          text: "无法获取视频信息，请检查链接是否正确。",
        });
        return;
      }

      // 发送第一个视频
      await client.sendMessage(event.chatId, {
        file: videoUrls[0],
      });

      // 删除提示消息
      await client.deleteMessages(getmsg.chatId, [getmsg.id], {
        revoke: true,
      });
    } catch (error) {
      console.error("请求失败:", error);
      await client.sendMessage(event.chatId, {
        message: `消息发送失败: ${error.message}`,
      });
    }
  }
}
