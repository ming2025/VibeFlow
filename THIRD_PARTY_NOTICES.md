# 第三方来源与许可

HTML 内置以下固定依赖。版权与完整许可见 [THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt)，来源及 SHA256 见 [dependency-manifest.json](dependency-manifest.json)。

| 依赖 | 版本 | 用途 | 许可 |
| --- | --- | --- | --- |
| [LZString](https://github.com/pieroxy/lz-string) | 1.5.0 | 压缩存储 / 备份 | MIT |
| [html2canvas](https://github.com/niklasvh/html2canvas) | 1.4.1 | 画布图片 | MIT |
| [Marked](https://github.com/markedjs/marked) | 18.1.1 | Markdown 解析 | MIT |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.4.17 | 富文本清理 | MPL-2.0 或 Apache-2.0 |
| [Diff Match Patch](https://github.com/google/diff-match-patch) | 1.0.5 | 文本对比 | Apache-2.0 |

来源为对应固定版本 npm 包，脚本以数据 URL 内置，无运行时 CDN 依赖。Diff Match Patch 的 CommonJS 导出增加浏览器环境判断，原算法与许可保留。

框架模板属于任务组织提示词，不附带或复现论文训练代码。项目 MIT 许可不覆盖第三方各自的独立许可。
