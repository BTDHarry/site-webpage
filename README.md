# site-webpage
site webpage design

your-repo/
├─ apps/
│  ├─ web/                 # TanStack Start 前端
│  │  ├─ src/
│  │  ├─ public/
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ ...（TanStack Start 生成的）
│  └─ api/                 # FastAPI 后端
│     ├─ app/
│     │  ├─ main.py
│     │  ├─ api/           # 路由
│     │  ├─ core/          # 配置、鉴权等
│     │  ├─ models/        # ORM 模型（如 SQLAlchemy）
│     │  ├─ schemas/       # Pydantic
│     │  └─ services/      # 业务逻辑
│     ├─ tests/
│     ├─ pyproject.toml    # 推荐用 Poetry / uv / pdm 之一管理
│     └─ ...（alembic/等）
├─ packages/               # 可选：共享库（前后端共用 types、OpenAPI 客户端等）
│  └─ shared/
├─ infra/                  # 可选：部署相关（k8s、nginx、terraform）
├─ docs/
├─ .github/
│  └─ workflows/           # CI：web/api 分开跑
├─ docker/
│  ├─ web.Dockerfile
│  ├─ api.Dockerfile
│  └─ compose.yml
├─ .editorconfig
├─ .gitignore
├─ README.md
└─ Makefile                # 可选：一键启动/测试/格式化

当前文件夹有 git 无法并入时
  rm -rf apps/web/.git
  git add apps/

在 .settings 设置 biome 的位置
  "biome.lsp.bin": "apps/web/node_modules/.bin/biome"
