/**
 * session-rainbow-border — CC GUI 工作区运行中对话光效增强插件 (v2.0.0)
 *
 * 核心功能：
 * 1. 为正在工作的会话项（左侧工作区列表 + 顶部活跃标签）提供多样化的高亮光效。
 * 2. 支持 8 种高对比度酷炫视觉风格（呼吸灯、烈焰、矩阵绿光、彩虹、警报、极光等）。
 * 3. 注册插件设置面板，提供原生 `<select>` 下拉选择框供用户自由调节模式、速度与粗细。
 * 4. 内置高保真实时交互预览卡片，即改即看，全应用热更新，零重启动态生效。
 * 5. 深度适配深色/浅色主题，提供显眼的【确定保存并应用】主按钮，交互体验顺畅。
 */

const MODES = [
  { id: "rainbow-flow", label: "🌈 彩虹跑马灯（经典 360° 全光谱顺滑旋转）" },
  { id: "pulse-breathing", label: "💫 闪烁呼吸灯（极速闪灭呼吸 · 强烈生命律动）" },
  { id: "fire-ember", label: "🔥 炽热烈焰（熔岩金焰 · 高能澎湃运转）" },
  { id: "cyber-matrix", label: "⚡ 赛博霓虹（矩阵绿光 · 极客科幻流光）" },
  { id: "aurora-dream", label: "🔮 幻彩极光（紫晶深邃 · 梦幻高雅流转）" },
  { id: "police-alert", label: "🚨 双色警报（红蓝爆闪对撞 · 极致醒目聚焦）" },
  { id: "golden-comet", label: "✨ 流金彗星（高光扫尾 · 流星掠过边框）" },
  { id: "ocean-wave", label: "🌊 蔚蓝脉动（深海波浪 · 清爽护眼专注）" },
];

const SPEEDS = [
  { id: "1.2s", label: "⚡ 极速冲刺 (1.2s) — 节奏明快，极具紧迫感" },
  { id: "2.2s", label: "🚀 动感流畅 (2.2s) — 官方推荐，动静皆宜" },
  { id: "3.8s", label: "🍃 优雅舒缓 (3.8s) — 温和轻柔，不扰思绪" },
  { id: "5.5s", label: "🧘 沉静平缓 (5.5s) — 极简克制，慢速流动" },
];

const THICKNESSES = [
  { id: "1.0px", label: "纤细微光 (1.0px) — 精致细腻" },
  { id: "1.6px", label: "标准平衡 (1.6px) — 官方推荐，清晰自然" },
  { id: "2.4px", label: "醒目加粗 (2.4px) — 轮廓分明，视觉突出" },
  { id: "3.2px", label: "强光聚焦 (3.2px) — 极其显眼，一眼即辨" },
];

const STORAGE_KEY = "session_border_config";

const DEFAULT_CONFIG = {
  mode: "rainbow-flow",
  speed: "2.2s",
  thickness: "1.6px",
};

/** 将用户配置应用到宿主根文档，触发 CSS 变量与动画模式即时重载 */
function applyGlobalConfig(cfg) {
  if (typeof document === "undefined") return;
  const mode = cfg.mode || DEFAULT_CONFIG.mode;
  const speed = cfg.speed || DEFAULT_CONFIG.speed;
  const thickness = cfg.thickness || DEFAULT_CONFIG.thickness;

  document.documentElement.setAttribute("data-session-border-mode", mode);
  document.documentElement.style.setProperty("--session-border-duration", speed);
  document.documentElement.style.setProperty("--session-border-thickness", thickness);
}

/** 卸载清理：还原根文档全局属性 */
function cleanupGlobalConfig() {
  if (typeof document === "undefined") return;
  document.documentElement.removeAttribute("data-session-border-mode");
  document.documentElement.style.removeProperty("--session-border-duration");
  document.documentElement.style.removeProperty("--session-border-thickness");
}

/** 插件设置面板组件 */
function createSettingsView(ctx) {
  const React = ctx.react;
  const { useState, useEffect, createElement: h } = React;

  return function SettingsSection() {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saved'

    useEffect(() => {
      let isMounted = true;
      ctx.storage.get(STORAGE_KEY).then((saved) => {
        if (isMounted && saved && typeof saved === "object") {
          const merged = { ...DEFAULT_CONFIG, ...saved };
          setConfig(merged);
          applyGlobalConfig(merged);
        }
      }).catch(() => {});
      return () => {
        isMounted = false;
      };
    }, []);

    // 下拉框改变时即时反馈到预览和临时状态
    const handleSelectChange = (key, value) => {
      const next = { ...config, [key]: value };
      setConfig(next);
      applyGlobalConfig(next);
      // 切换后恢复待保存提示
      setSaveStatus("idle");
    };

    // 用户明确点击【确定保存并应用】按钮
    const handleSave = () => {
      applyGlobalConfig(config);
      ctx.storage.set(STORAGE_KEY, config).then(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2400);
      }).catch((err) => {
        console.error("[session-rainbow-border] 保存配置失败:", err);
      });
    };

    // 恢复默认值
    const handleReset = () => {
      setConfig(DEFAULT_CONFIG);
      applyGlobalConfig(DEFAULT_CONFIG);
      ctx.storage.set(STORAGE_KEY, DEFAULT_CONFIG).then(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2400);
      }).catch(() => {});
    };

    return h(
      "div",
      { className: "srb-settings-container" },
      h(
        "div",
        { className: "srb-card" },
        // 头部标题与运行状态徽标
        h(
          "div",
          { className: "srb-header" },
          h(
            "div",
            { className: "srb-title-group" },
            h("h3", { className: "srb-title" }, "工作区对话光效定制"),
            h("p", { className: "srb-desc" }, "自定义正在工作与生成中的会话项边框视觉流光，一眼锁定活跃对话")
          ),
          h(
            "span",
            { className: "srb-badge" },
            h("span", { className: "srb-dot-pulse" }),
            "实时生效中"
          )
        ),

        // 实时效果预览区域
        h(
          "div",
          { className: "srb-preview-box" },
          h("div", { className: "srb-preview-label" }, "🎨 实时动态效果预览 (Live Preview)"),
          h(
            "div",
            {
              className: "srb-preview-wrap",
              "data-preview-mode": config.mode,
            },
            h(
              "div",
              { className: "srb-preview-item is-running" },
              // 会话引擎图标
              h(
                "svg",
                {
                  className: "srb-preview-icon",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                },
                h("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" })
              ),
              // 运行中小圆点指示器
              h("span", { className: "srb-preview-status-dot" }),
              // 会话文本
              h("span", { className: "srb-preview-text" }, "正在思考与执行代码任务… (当前选定效果实时展现)")
            )
          )
        ),

        // 核心表单配置区域
        h(
          "div",
          { className: "srb-form-grid" },

          // 1. 光效模式下拉选择
          h(
            "div",
            { className: "srb-field" },
            h("label", { className: "srb-label" }, "视觉光效模式 (Effect Style)"),
            h(
              "select",
              {
                className: "srb-select",
                value: config.mode,
                onChange: (e) => handleSelectChange("mode", e.target.value),
              },
              MODES.map((item) =>
                h("option", { key: item.id, value: item.id }, item.label)
              )
            ),
            h("p", { className: "srb-hint" }, "提供 8 种高对比度视觉风格，包含闪灭呼吸灯、炫彩跑马灯、赛博科技与警报光效。")
          ),

          // 2. 动画速度下拉选择
          h(
            "div",
            { className: "srb-field" },
            h("label", { className: "srb-label" }, "动画流转速度 (Motion Speed)"),
            h(
              "select",
              {
                className: "srb-select",
                value: config.speed,
                onChange: (e) => handleSelectChange("speed", e.target.value),
              },
              SPEEDS.map((item) =>
                h("option", { key: item.id, value: item.id }, item.label)
              )
            ),
            h("p", { className: "srb-hint" }, "调节光圈旋转或呼吸起伏的周期节奏，支持从极速到舒缓多档位调节。")
          ),

          // 3. 边框粗细与发光程度
          h(
            "div",
            { className: "srb-field" },
            h("label", { className: "srb-label" }, "高亮边框粗细 (Border Thickness)"),
            h(
              "select",
              {
                className: "srb-select",
                value: config.thickness,
                onChange: (e) => handleSelectChange("thickness", e.target.value),
              },
              THICKNESSES.map((item) =>
                h("option", { key: item.id, value: item.id }, item.label)
              )
            ),
            h("p", { className: "srb-hint" }, "调节高亮光环的边缘宽度，加粗可显著增强强光或复杂环境下的辨识度。")
          )
        ),

        // 底部显眼的主操作保存栏与重置栏
        h(
          "div",
          { className: "srb-footer" },
          h(
            "div",
            { className: "srb-footer-left" },
            saveStatus === "saved"
              ? h(
                  "span",
                  { className: "srb-save-toast visible" },
                  h(
                    "svg",
                    { viewBox: "0 0 20 20", fill: "currentColor", className: "srb-toast-icon" },
                    h("path", {
                      fillRule: "evenodd",
                      d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                      clipRule: "evenodd",
                    })
                  ),
                  "配置已成功保存并立即生效！"
                )
              : h("span", { className: "srb-hint-tip" }, "💡 选择满意效果后，点击右侧确定按钮即可锁定配置")
          ),
          h(
            "div",
            { className: "srb-footer-actions" },
            h(
              "button",
              {
                type: "button",
                className: "srb-btn-reset",
                onClick: handleReset,
                title: "还原为默认彩虹跑马灯配置",
              },
              "↺ 恢复默认值"
            ),
            h(
              "button",
              {
                type: "button",
                className: `srb-btn-save ${saveStatus === "saved" ? "is-success" : ""}`,
                onClick: handleSave,
              },
              saveStatus === "saved" ? "✓ 已保存成功" : "💾 确定保存并应用"
            )
          )
        )
      )
    );
  };
}

/** 插件激活主入口 */
export default function activate(ctx) {
  // 1. 初始化时从存储拉取历史配置并应用
  ctx.storage.get(STORAGE_KEY).then((saved) => {
    if (saved && typeof saved === "object") {
      applyGlobalConfig({ ...DEFAULT_CONFIG, ...saved });
    } else {
      applyGlobalConfig(DEFAULT_CONFIG);
    }
  }).catch(() => {
    applyGlobalConfig(DEFAULT_CONFIG);
  });

  // 2. 注册设置面板页面
  const settingsDisposer = ctx.ui.registerSettingsSection({
    key: "settings",
    label: () => "对话运行光效",
    component: createSettingsView(ctx),
  });

  // 3. 卸载销毁清理
  return () => {
    if (typeof settingsDisposer === "function") {
      try {
        settingsDisposer();
      } catch (err) {
        console.error("[session-rainbow-border] 卸载设置页面异常:", err);
      }
    }
    cleanupGlobalConfig();
  };
}
