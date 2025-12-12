# 🌊 VibeFlow: AI Workflow Engineering Tool

> **不要只做 AI 的提问者，做指挥 AI 分工协作的架构师。**
> Don't just prompt; Architect the flow.

![VibeFlow Screenshot](https://github.com/ming2025/VibeFlow/blob/main/screenshot.png)


---

## 📖 简介 (Introduction)

**VibeFlow** 是一个轻量级、本地化、可视化的 **AI 工作流工程 (Workflow Engineering)** 工具。

在复杂的 AI 开发任务（如编写整个软件、长篇复杂的分析报告）中，单纯的 "Prompt Engineering" 往往会遇到上下文丢失、逻辑混乱的问题。VibeFlow 通过**节点化 (Node-based)** 的方式，将复杂任务拆解为标准化的流水线，让 AI 在不同的步骤扮演不同的角色（产品经理 -> 设计师 -> 工程师），实现高质量的产出。

## ✨ 核心特性 (Features)

- **🧠 可视化思维链**：类似 ComfyUI 的画布，拖拽连线，直观管理复杂的思考路径。
- **🔒 100% 数据隐私**：纯静态 HTML 单文件，无后端服务器，所有数据存储在本地浏览器。
- **🤖 角色分工 (Role-Playing)**：支持为每个节点设定独立的 AI 角色（System Prompt）。
- **⚡️ 结构化流转**：支持将上一个节点的输出（JSON/Markdown）无损传递给下一个节点。
- **📂 导入/导出**：一键保存工作流为 JSON，方便分享 SOP（标准作业程序）。

## 🚀 快速开始 (Quick Start)

1.  **访问工具**：下载本项目中的 `index.html` 本地打开。
2.  **加载示例**：点击工具栏的 `Import`，选择 `examples` 文件夹下的 `vibe_workflow.json` (Mini-Canva 开发流) 体验全流程。
3.  **创建你的流**：
    - 双击空白处新建节点。
    - 定义 `Context` (背景) 和 `Prompt` (指令)。
    - 将 Prompt 发送给 ChatGPT/Claude，将返回结果填入下一个节点。

## 📂 经典案例 (Use Cases)

在 `examples/` 文件夹中包含以下工作流：

| 文件名 | 描述 | 复杂度 |
| :--- | :--- | :--- |
| `vibe_workflow.json` | **Mini-Canva 开发实战**：从需求分析到代码落地的全自动化链路。 | ⭐⭐⭐ |
| `personal_ip_design.json` | **个人 IP 页面复刻**：解析设计风格并生成前端代码。 | ⭐⭐ |

## 🛠️ 部署与贡献 (Development)

本项目极其精简，核心代码仅为一个 HTML 文件。
如果你想修改功能：
1. `git clone` 本仓库。
2. 直接编辑 `index.html`。
3. 提交 PR (Pull Request) 给我们！

## 📄 License

MIT License © 2025 [ming2025]

---
*Built with ❤️ by Workflow Engineers.*
