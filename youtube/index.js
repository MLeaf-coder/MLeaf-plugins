import youtubeDl from "youtube-dl-exec";
import path from "path";
import fs from "fs";

// 动态设置缓存目录，取自项目根目录
const projectDir = process.cwd();
const tmpDir = path.join(projectDir, "caching", "puppeteer");
// 确保目录存在
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

async function getAudioInfo(url) {
  try {
    // 先获取视频信息
    const info = await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
    });

    // 对文件名进行简单过滤，避免非法字符
    const sanitize = (name) => name.replace(/[\\/:\"*?<>|]+/g, "");
    const fileName = sanitize(info.title) + ".mp3";
    const filePath = path.join(tmpDir, fileName);

    // 下载音频
    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0,
      output: filePath,
      noCheckCertificates: true,
      noWarnings: true,
    });

    return {
      duration: info.duration,
      title: info.title,
      uploader: info.uploader,
      filePath,
    };
  } catch (error) {
    console.error("操作失败:", error.message);
    throw error;
  }
}

export default async function (client, event) {
  try {
    const message = event.message;
    const tip = await client.sendMessage(message.chatId, {
      message: "正在获取YouTube音乐信息...",
      replyTo: message.id,
    });

    try {
      const url = message.message.split(" ")[1];
      if (!url) {
        throw new Error("请提供YouTube视频链接");
      }

      const result = await getAudioInfo(url);

      // 更新提示消息
      await client.editMessage(tip.chatId, {
        message: tip.id,
        text: `已获取音频：${result.title}\n正在上传...`,
      });

      // 上传音频文件
      await client.sendMessage(message.chatId, {
        file: result.filePath,
        replyTo: message.id,
      });

      // 上传后删除本地文件
      fs.unlink(result.filePath, (err) => {
        if (err) {
          console.error("删除本地文件失败:", err);
        }
      });
    } catch (error) {
      console.error("下载或上传失败:", error);
      // 发送错误消息
      await client.sendMessage(message.chatId, {
        message: `处理失败: ${error.message}`,
        replyTo: message.id,
      });
    } finally {
      await client.deleteMessages(message.chatId, [tip.id], { revoke: true });
    }
  } catch (error) {
    console.error("获取YouTube音乐信息失败:", error);
  }
}
