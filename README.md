现在每次管理员权限更新汇率时：
  1. 在管理员界面修改汇率
  2. 点击"Save to API"按钮
  3. 系统自动保存到API
  4. 自动提交到git仓库，commit消息包含：
    - "exchange rate of P5" (或相应的P值)
    - 详细的汇率数据
    - 自动生成的标记

## 部署配置

### 环境变量设置

如果要部署到生产环境（如Vercel、Netlify等），需要配置以下环境变量：

```
SUPABASE_URL=你的Supabase项目URL
SUPABASE_KEY=你的Supabase匿名密钥
```

### Vercel部署步骤：

1. 登录 [Vercel控制台](https://vercel.com/dashboard)
2. 找到项目 → Settings → Environment Variables
3. 添加上述两个环境变量
4. 重新部署项目

### 本地开发：

1. 复制 `.env.example` 为 `.env.local`
2. 填入你的实际Supabase配置信息
3. 运行 `npm run dev`

## 技术栈

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **Deployment**: Vercel
