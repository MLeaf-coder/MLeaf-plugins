import fs from "fs";
import yaml from "js-yaml";
import Gemini from "./api/Gemini.js";
import Qwen from "./api/Qwen.js";

// 读取配置文件
function loadConfig() {
  const file = fs.readFileSync(
    "./plugins/MLeaf-plugins/Gemini/ai.yaml",
    "utf8"
  );
  return yaml.load(file);
}

// 保存配置文件
function saveConfig(config) {
  fs.writeFileSync(
    "./plugins/MLeaf-plugins/Gemini/ai.yaml",
    yaml.dump(config),
    "utf8"
  );
}

// 选择当前激活的 AI 模型
function getActiveAI() {
  const config = loadConfig();
  if (config.state.Qwen) {
    return Qwen;
  } else if (config.state.Gemini) {
    return Gemini;
  }
  return null;
}

export { getActiveAI, Gemini };
