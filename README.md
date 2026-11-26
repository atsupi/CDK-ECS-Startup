# CDK ECS Startup

AWS CDK（TypeScript）で、React製ToDoアプリをAWS上に構築するサンプルです。

フロントエンドとバックエンドをそれぞれECS on Fargateで実行し、データをAmazon DynamoDBに保存します。

## 設計解説記事 (Zenn)

本リポジトリのアーキテクチャ選定理由、ローカル環境と本番AWS環境の差異吸収の仕組み、テスト・CI戦略については、以下の技術記事で詳しく解説しています。

- **[AWS CDKで始めるECS Fargateフルスタック構成 (Zenn) ](https://zenn.dev/atsupi/articles/fd116194f92631)**

## 構成

```text
Browser
  │
  ▼
Application Load Balancer
  ├── /       → Frontend (React + Nginx on ECS/Fargate)
  └── /api/*  → Backend (Node.js + Express on ECS/Fargate)
                         │
                         ▼
                    Amazon DynamoDB
```

### 使用技術

- AWS CDK v2 / TypeScript
- Amazon ECS on AWS Fargate
- Application Load Balancer
- Amazon DynamoDB
- React / Vite / Nginx
- Node.js / Express
- Docker Compose / DynamoDB Local（ローカル開発用の構成）

## ディレクトリ構成

```text
.
├── backend/                  # Express API
│   ├── Dockerfile
│   └── index.js
├── bin/
│   └── ecs-app.ts            # CDKアプリのエントリーポイント
├── frontend/                 # ReactアプリとNginx設定
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── lib/
│   └── ecs-fullstack-stack.ts # AWSリソース定義
├── docker-compose.yml
└── cdk.json
```

## 前提条件

- Node.js と npm
- Docker
- AWS CLI
- AWS CDK CLI（未インストールの場合は npx cdk を利用できます）
- デプロイ先AWSアカウントへの認証設定

## AWSへのデプロイ

### 1. 依存関係をインストール
```bash
npm install
```
### 2. AWS CDK環境を初期化

対象アカウント・リージョンで初めてCDKを利用する場合に実行します。
```bash
npx cdk bootstrap
```
CDKアプリは、```CDK_DEFAULT_ACCOUNT``` と ```CDK_DEFAULT_REGION``` を参照します。
リージョンが未設定の場合は ap-northeast-1 が使用されます。

### 3. CloudFormationテンプレートを確認
```bash
npx cdk synth
```
### 4. デプロイ
```bash
npx cdk deploy
```
デプロイ完了後、CloudFormationの出力に表示される ```ALBURL``` にアクセスしてください。

## API

| Method | Path | 説明 |
| --- | --- | --- |
| GET | /api/health | ヘルスチェック |
| GET | /api/todos | ToDo一覧を取得 |
| POST | /api/todos | ToDoを作成 |

ToDo作成リクエストの例：
```bash
curl -X POST "$ALB_URL/api/todos" \
  -H "Content-Type: application/json" \
  -d '{"task":"CDKを学ぶ"}'
```
## ローカル開発

リポジトリにはDocker ComposeとDynamoDB Localの設定があります。
```bash
docker compose up --build
```
ローカル起動する場合は、```frontend/nginx.conf``` のAPIプロキシ先がCompose上のバックエンドサービスを参照すること、およびDynamoDB Localに ```TodoTable``` が作成されていることを確認してください。

## AWSリソースに関する注意

- このスタックは、インターネット向けALBとパブリックサブネット上のFargateサービスを作成します。
- NAT Gatewayを作成しない構成ですが、AWS利用料金が発生するリソースがあります。デプロイ前に料金を確認してください。
- DynamoDBテーブルには、現在 ```RemovalPolicy.DESTROY``` を設定しています。スタック削除時にテーブルも削除されるため、必要なデータを事前に退避してください。
- この構成は学習・検証向けのサンプルです。

## 削除

作成したAWSリソースを削除するには、次を実行します。
```bash
npx cdk destroy
```
DynamoDBテーブルも削除する設定をしているため、必要なデータがある場合は事前にバックアップしてください。

## ライセンス

[MIT License](./LICENSE)