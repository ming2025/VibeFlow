# 🌊 VibeFlow: AI Workflow Engineering Tool

> **从 Prompt Engineering 到 Workflow Engineering 的进化。**
> From Prompt Engineering to Workflow Engineering.

**VibeFlow** 是一个轻量级、本地化、可视化的 AI 工作流管理工具。它旨在解决单纯依靠 Prompt 对话时面临的“上下文碎片化”和“过程不可控”问题。通过将复杂的 AI 任务拆解为结构化的**节点（Nodes）**和**角色（Roles）**，实现高质量、可复用的 AI 协作流程。

[👉 **点击这里直接使用 VibeFlow**](https://你的用户名.github.io/VibeFlow/)
*(无需安装，打开即用)*

## ✨ 核心理念 (Core Philosophy)

传统的 AI 开发往往受限于单点对话的不可控性。**工作流工程（Workflow Engineering）** 主张：
1.  **节点化 (Node-based)**：将任务拆解为需求、策略、执行等独立环节。
2.  **角色化 (Role-Playing)**：每个节点由特定的 AI 角色（如产品经理、架构师）负责。
3.  **流转化 (Chain-of-Thought)**：上一个节点的输出（JSON/Markdown）无损转化为下一个节点的输入。

## 🚀 功能特点 (Features)

* **可视化编排**：类似 ComfyUI 的节点拖拽界面，直观管理思维链路。
* **纯本地运行**：单文件 HTML，无后端，数据完全存储在本地浏览器，安全隐私。
* **结构化输出**：支持将工作流导出为 JSON 或 Markdown，方便分享与复用。
* **状态管理**：清晰标记 TODO / DOING / DONE 状态，像管理项目一样管理 AI 对话。

## 📖 如何使用 (How to Use)

1.  打开 [在线版本](https://你的用户名.github.io/VibeFlow/) 或下载本项目中的 `index.html` 本地打开。
2.  **创建节点**：双击画布空白处创建新节点。
3.  **定义任务**：
    * **Context**：输入当前任务的背景或上一步的产出。
    * **Prompt**：输入给 AI 的指令（定义角色和目标）。
4.  **连接节点**：拖拽节点端口进行连接，形成工作流。
5.  **执行与迭代**：将 Prompt 复制给 AI（ChatGPT/Gemini/Claude），并将 AI 的回复填入下一个节点的 Context 中。

## 📂 示例 (Examples)

在 `examples` 文件夹中，你可以找到以下经典工作流：
* `vibe_workflow.json`: **Mini-Canva 开发流** - 从截图到代码的全栈开发全过程。
* `personal_ip_design.json`: **个人 IP 页面设计** - 深度解析设计风格并复刻。

你可以点击工具栏的 **"Import"** 按钮加载这些 JSON 文件进行体验。

## 🛠️ 技术栈 (Tech Stack)

* 原生 HTML5 / CSS3 / JavaScript (ES6+)
* 无任何外部庞大依赖，极致轻量。

---

*Created by [你的名字/GitHub ID].*
*License: MIT*
