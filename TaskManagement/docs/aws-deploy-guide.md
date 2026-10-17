# AWSデプロイ手順書（Claude Code + Terraform）

初めてAWSとTerraformを使う方を対象に、用語の解説と手順をまとめます。
AWSマネジメントコンソールでの手作業は行わず、**AWS CLI と Terraform を Claude Code から実行**して構築します。

本手順は学習用です。スクールの講座と同じ構成（EC2 に Java をインストールして実行）を採用し、**無料枠で収まる範囲**で**段階的に作成**します。

---

## 1. 段階計画

| 段階 | 内容 | 状態 |
|------|------|------|
| 準備 | AWS CLI・Terraform の設定、tfstate 用 S3 バケット（bootstrap） | 完了 |
| **段階1** | **EC2 1台**に Java をインストールし、フロント・バックエンドを同じサーバー（Spring Boot）で動かして動作確認する | 完了 |
| 段階2 | DB を RDS PostgreSQL にする（EC2 からのみ接続可能） | 完了 |
| 段階3 | 必要に応じて構成を見直す（CloudFront / S3 など） | 任意 |

> 段階ごとに「作成 → 動作確認 → 次へ」を行います。前の段階で動作確認が済むまで、次の段階のリソースは作りません。

---

## 2. 構成（段階1・段階2）

### 2.1 構成図

```
ユーザー（ブラウザ）
  │ http://<EC2のパブリックIP>:8080/
  ▼
EC2 t2.micro（Amazon Linux 2023）
  └─ Spring Boot（8080番）…画面（React のビルド結果）も API も同じアプリから返す
        │ 5432番（VPC内のみ。EC2のセキュリティグループからだけ許可）
        ▼
      RDS PostgreSQL（プライベートサブネット・インターネットから非公開）

自分のPC ── 8080番（アプリ）・22番（SSH）──▶ EC2
          ※ どちらも自分のIPからのみ許可。他の接続元は受け付けない
```

- 画面と API を同じ Spring Boot から配信するため、CORS の設定は不要です。
- アプリには認証がないため、8080番も22番も**自分のIPアドレスからの通信だけ**を許可します。

### 2.1.1 動作バージョン

| 対象 | バージョン | 備考 |
|------|-----------|------|
| Java（EC2 での実行） | 25 | `backend/build.gradle` の toolchain が 25 のため、実行にも 25 が必要 |
| Spring Boot | 4.0.6 | |
| PostgreSQL（RDS） | 17（17.9） | ローカルの `postgres:17` と同じメジャーバージョン |
| Node.js / TypeScript | 手元の Mac でのビルド用（EC2 には入れない） | 手元は Node 25.2.1、TypeScript 6.0.2 |
| OS | Amazon Linux 2023 | |

> Java 25 のパッケージ名（`java-25-amazon-corretto-headless`）が Amazon Linux 2023 で見つからない場合は、起動スクリプトが Corretto の tar.gz を直接配置します。

### 2.2 Terraform のファイル構成

配置場所は `infra/envs/stage1/` です。

| ファイル | 内容 |
|---------|------|
| `main.tf` | AWS プロバイダー設定、tfstate の保存先（S3） |
| `variables.tf` | リージョン、プロジェクト名、インスタンスタイプなどの変数 |
| `terraform.tfvars` | 変数の値（自分のIP・SSH公開鍵）。Git 管理外 |
| `backend.hcl` | tfstate 用バケット名（アカウントIDを含む）。Git 管理外 |
| `vpc.tf` | VPC + パブリックサブネット2つ + インターネットゲートウェイ |
| `security_groups.tf` | EC2用（8080 と 22 番ポート。どちらも自分のIPのみ） |
| `ec2.tf` | t2.micro + Amazon Linux 2023 + Java のインストール |
| `rds.tf` | RDS PostgreSQL、プライベートサブネット2つ、RDS用セキュリティグループ（EC2からのみ許可） |
| `outputs.tf` | EC2 のIPアドレス、アプリURL、RDS の接続先 |

### 2.3 使うAWSリソース

| リソース | 役割 | 無料枠 |
|---------|------|-------|
| VPC・パブリックサブネット2つ・インターネットゲートウェイ | EC2 を置くネットワーク | 無料 |
| セキュリティグループ | 8080 と 22 を、自分のIPのみ許可 | 無料 |
| キーペア | SSH ログイン用の公開鍵を登録 | 無料 |
| EC2 t2.micro | アプリを動かすサーバー | 12か月無料（対象アカウントのみ） |
| RDS PostgreSQL（db.t4g.micro・20GB・単一AZ） | データベース。EC2 からのみ接続可能 | 12か月無料（対象アカウントのみ） |
| プライベートサブネット2つ | RDS 専用（インターネットへの経路なし） | 無料 |
| パブリックIPv4 | EC2 に割り当てられるIPアドレス | 無料枠内（750時間/月）。超えると費用が発生 |

> **無料枠の注意**: 「12か月無料」は、アカウントの作成時期などにより対象かどうかが決まります。作業前に 4.3 節の確認を行ってください。
> EC2 を停止して再開すると、パブリックIPが変わります。
> RDS は停止しても7日で自動的に再開されるため、使わない場合は削除（`terraform destroy`）を推奨します。

### 2.4 接続元を自分のIPに絞る理由

- **22番（SSH）**: 全世界（`0.0.0.0/0`）に開けると、世の中の自動攻撃（総当たりのログイン試行）の対象になります。
- **8080番（アプリ）**: このアプリには認証がないため、全世界に開けると、IPアドレスを知っている人なら誰でもカードの閲覧・追加・削除ができてしまいます。

そのため、どちらも自分のグローバルIP（例: `203.0.113.10/32`）だけを許可します。Terraform の変数 `allowed_cidr` で指定し、`0.0.0.0/0` を指定するとエラーになるようにしています。

> **IPが変わった場合**: 自宅のIPは時々変わります。変わると、SSH だけでなくアプリの画面も開けなくなります。`curl https://checkip.amazonaws.com` で現在のIPを確認し、`allowed_cidr` を更新して `terraform apply` してください。
>
> **IPを Git に入れない**: 実際のIPは `terraform.tfvars`（Git 管理外）にだけ書きます。`terraform.tfvars.example` は Git に入るため、ダミー値のままにしてください。

---

## 3. 基本概念の解説

### 3.1 IaC（Infrastructure as Code）とは

サーバーやネットワークなどの構成を、**手作業ではなくコード（テキストファイル）で定義する考え方**です。

- 同じ構成を何度でも再現できる
- 変更履歴をGitで管理できる
- 「何を作ったか」がコードを読めば分かる

### 3.2 Terraform とは

IaC のためのツールです。HCL という設定言語でリソースを記述し、実際のAWSに反映させます。

| 用語 | 意味 |
|------|------|
| **provider** | AWSなどの接続先を指定する設定（例: `provider "aws"`） |
| **resource** | 作成するもの1つ分の定義（例: `aws_instance`） |
| **data** | 既存の情報を読み取る定義（例: 最新のAmazon Linux のAMIを探す） |
| **variable** | 外から値を渡すための入力（例: リージョン、インスタンスタイプ） |
| **output** | 作成後に表示する値（例: EC2 のパブリックIP） |
| **state（tfstate）** | 「Terraformが今どのリソースを作ったか」の記録ファイル |

### 3.3 Terraform の基本コマンド

| コマンド | 何をするか | 実際のAWSへの影響 |
|---------|-----------|-----------------|
| `terraform init` | 必要なプラグインを取得し、stateの保存先を準備する | なし |
| `terraform plan` | 「これから何が作成・変更・削除されるか」を表示する | なし（確認のみ） |
| `terraform apply` | planの内容を実際のAWSに反映する | **あり** |
| `terraform destroy` | 作成したリソースをすべて削除する | **あり（削除）** |

> **鉄則**: `apply` の前には必ず `plan` の出力を読み、想定外の「削除（-）」がないことを確認します。

### 3.4 tfstate（状態ファイル）の注意点

- Terraformが作ったリソースのIDなどを記録したファイルです。
- **失うと Terraform がリソースを追跡できなくなります。** そのため、S3に保管し、バージョニングを有効にします（bootstrap で作成済み）。
- 機密値が平文で含まれることがあるため、**アクセスできる人を限定**します。Gitには絶対にコミットしません。

---

## 4. 認証と環境構築

### 4.1 認証の注意事項

| やってよい | やってはいけない |
|-----------|----------------|
| 認証情報をAWS CLIのプロファイルに保存する | アクセスキーやパスワードをチャットや Git に貼る |
| 不要になったアクセスキーを無効化・削除する | 使わなくなったアクセスキーを放置する |
| ルートユーザーはアカウント設定時だけ使う | ルートユーザーで日常作業をする |
| MFA（多要素認証）を有効にする | MFAを無効のまま運用する |
| SSH 秘密鍵を自分のPCだけに置く | 秘密鍵を Git やチャットに貼る |

予算アラート（AWS Budgets）を設定し、想定外の課金を検知できるようにしてください（例: 月額1,000円を超えたら通知）。

### 4.2 ツールのインストール（macOS の例）

```bash
brew install awscli tfenv
tfenv install 1.11.0
tfenv use 1.11.0
terraform version
```

### 4.3 AWS CLI の認証設定と無料枠の確認

アクセスキーはご自身のターミナルで入力し、チャットには貼らないでください。

```bash
aws configure --profile taskmanagement-prod
aws sts get-caller-identity --profile taskmanagement-prod
aws freetier get-free-tier-usage --profile taskmanagement-prod --region us-east-1
```

- `get-caller-identity` でアカウントIDとユーザー名が表示されれば認証成功です。
- `get-free-tier-usage` の結果に EC2 の「12か月無料」の項目が含まれるかを確認します。含まれない場合は、対象外の可能性があります。

### 4.4 bootstrap（完了済み）

Terraform の状態ファイルを保管する S3 バケット `taskmanagement-tfstate-<アカウントID>` を作成済みです（バージョニング・暗号化有効、公開禁止）。段階1以降の backend 設定で使います。

---

## 5. 段階1：EC2 の作成と動作確認

### 5.1 アプリの事前準備（コード変更）

段階1の前に、以下をアプリ側で修正します（別PRで実施）。

| 対象 | 変更内容 | 理由 |
|------|---------|------|
| `frontend/src/api/client.ts` | `http://localhost:8080/api` → `/api` | 同じサーバーから画面と API を返すため |
| `backend/src/main/resources/application.yml` | DB接続情報を環境変数（`SPRING_DATASOURCE_URL` など）で受け取る | パスワードをコードに残さないため |
| ビルド手順 | `frontend` の `npm run build` の結果を、`backend/src/main/resources/static/` に配置して jar に含める | 1つの jar で画面と API を配信するため |

ローカルでビルドして動作確認してから、段階1に進みます。

### 5.2 SSH 鍵の準備と変数の設定

```bash
# 鍵の作成（パスフレーズの設定を推奨）
ssh-keygen -t ed25519 -f ~/.ssh/taskmanagement-key

# 自分のグローバルIPを確認
curl https://checkip.amazonaws.com
```

```bash
cd infra/envs/stage1
cp terraform.tfvars.example terraform.tfvars
cp backend.hcl.example backend.hcl
# terraform.tfvars を編集（.example ではなく、必ずコピーした terraform.tfvars に書く）:
#   allowed_cidr   = "<自分のIP>/32"
#   ssh_public_key = "<~/.ssh/taskmanagement-key.pub の中身>"
# backend.hcl を編集:
#   bucket = "taskmanagement-tfstate-<AWSアカウントID>"
```

> 秘密鍵（`taskmanagement-key`）は絶対に共有しない・コミットしないでください。`terraform.tfvars` と `backend.hcl` は Git 管理外です。
> AWS アカウントIDやIPアドレスを公開リポジトリに載せないため、これらは `.example` ではなく実ファイルに書きます。
> コミット前に `git status` を確認し、`terraform.tfvars` と `backend.hcl` が表示されないこと（無視されていること）を確認してください。

### 5.3 Terraform で EC2 を作成（段階1のみ）

```bash
cd infra/envs/stage1
terraform init -backend-config=backend.hcl
terraform plan -out=tfplan
```

**plan の出力を読む**: `+`（作成）のみで、`-`（削除）が無いことを確認します。

```bash
terraform apply tfplan
```

作成されるもの:
- VPC・パブリックサブネット2つ・インターネットゲートウェイ・ルートテーブル
- セキュリティグループ（8080 と 22 を、自分のIPのみ）
- キーペア
- EC2 t2.micro（Amazon Linux 2023。起動時に Java と PostgreSQL をインストールする）

完了後、outputs の `ec2_public_ip`・`app_url` を控えます。

### 5.4 DB（RDS）の準備

DB は RDS PostgreSQL（`infra/envs/stage1/rds.tf`）です。5.3 の `terraform apply` で作成され、データベース名（`taskmanagement`）とユーザー（`taskuser`）もこのとき作られるため、手作業での作成は不要です。

- RDS はプライベートサブネットに置き、インターネットからは接続できません。
- RDS のセキュリティグループは、5432番を **EC2 のセキュリティグループからのみ**許可します。
- パスワードは Terraform が自動生成します。`terraform output -raw rds_password` で取得できます（画面やチャットに貼らない）。
- EC2 に入れた PostgreSQL は使いません（メモリ節約のため停止しておく）。

```bash
# EC2 で PostgreSQL（EC2内）を止める
sudo systemctl disable --now postgresql
```

### 5.5 アプリを配置して起動

手元の Mac で jar を作成し、EC2 に転送します。

```bash
# 手元（フロントをビルドして jar に含める）
cd frontend && npm ci && npm run build
mkdir -p ../backend/src/main/resources/static
cp -R dist/. ../backend/src/main/resources/static/
cd ../backend && ./gradlew bootJar

# 転送
scp -i ~/.ssh/taskmanagement-key build/libs/task-management-0.0.1-SNAPSHOT.jar ec2-user@<パブリックIP>:/opt/app/app.jar
```

EC2 上で、RDS の接続情報を **root だけが読めるファイル**に保存し、systemd のサービスとして登録します。

```bash
# /etc/taskmanagement.env（権限 600、所有者 root）
SPRING_DATASOURCE_URL=jdbc:postgresql://<RDSのアドレス>:5432/taskmanagement
SPRING_DATASOURCE_USERNAME=taskuser
SPRING_DATASOURCE_PASSWORD=<terraform output -raw rds_password の値>
```

```ini
# /etc/systemd/system/taskmanagement.service
[Unit]
Description=TaskManagement (Spring Boot)
After=network-online.target
Wants=network-online.target

[Service]
User=ec2-user
EnvironmentFile=/etc/taskmanagement.env
ExecStart=/usr/bin/java -Xmx400m -XX:+UseSerialGC -jar /opt/app/app.jar
Restart=on-failure
RestartSec=5
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now taskmanagement
sudo journalctl -u taskmanagement --no-pager | grep -E "Flyway|Started"
```

- `-Xmx400m`: Java が使うメモリの上限。t2.micro（メモリ約1GB）で動かすため。
- 初回起動時に Flyway が V1〜V4 を実行し、テーブルとサンプルデータが RDS に作られます。
- パスワードは画面に出さないよう、`terraform output -raw rds_password` を SSH の標準入力で渡して書き込みます。

### 5.6 動作確認

手元のブラウザで `http://<パブリックIP>:8080/` を開きます。

```bash
curl -s http://<パブリックIP>:8080/api/boards
```

---

## 6. 動作確認チェックリスト（段階1）

- [ ] `http://<パブリックIP>:8080/` でボード一覧が表示される
- [ ] ボード詳細 → カード追加 → 検索 → ドラッグ&ドロップが動く
- [ ] アプリを再起動してもデータが保持されている
- [ ] 8080番・22番に、自分のIP以外から接続できない（スマホのモバイル回線などで確認）
- [ ] RDS（5432番）に、EC2 以外から接続できない（手元の Mac から接続できない）
- [ ] EC2 から RDS に接続できる（`psql` で接続できる）

---

## 7. 段階2以降（概要）

- **段階2（RDS）**: 完了。RDS PostgreSQL を作成し、バックエンドの接続先を RDS にした。
- **段階3（任意）**: CloudFront や S3 を追加するなど、構成を見直す。

---

## 8. 費用と撤収（重要）

- 無料枠（12か月）の対象であれば、EC2 t2.micro と、パブリックIPv4 の750時間は無料枠内に収まります。
- 無料枠の対象外、または12か月経過後は費用が発生します。使わない時間は EC2 を停止（stop）してください。
- 学習後の撤収:

```bash
cd infra/envs/stage1
terraform destroy
```

- 撤収後、AWSコンソール（または CLI）で **残っているリソースがないか** 確認します。
- tfstate 用のバケットは、再構築しない場合のみ削除します。

---

## 9. よくあるエラーと対処

| 症状 | 原因の例 | 対処 |
|------|---------|------|
| `aws sts get-caller-identity` が失敗する | 認証情報の設定ミス・無効化されたキー | `aws configure --profile taskmanagement-prod` でキーを設定し直す |
| SSH やアプリ画面（8080）に接続できない（タイムアウト） | 自分のIPが変わった、起動直後 | `curl https://checkip.amazonaws.com` で現在のIPを確認し、`allowed_cidr` を更新して `terraform apply` |
| SSH で `Permission denied` | 鍵の指定ミス | `-i` の鍵パスと、登録した公開鍵が一致しているか確認 |
| `terraform plan` で `allowed_cidr` を 0.0.0.0/0 にできない | 変数の検証が働いている | 自分のIP（/32）を指定する |
| アプリが起動しない | Java のバージョン違い、DB 接続情報の誤り | `/opt/app/app.log` を確認。`java -version` が 25 であることを確認 |
| Java 25 がインストールされていない | AL2023 のパッケージ名が異なる | `dnf search corretto` で名前を確認し、`java_package` 変数を修正 |
| 8080番にアクセスできない | アプリが起動していない、セキュリティグループ | `ss -ltn` で 8080 を待ち受けているか、セキュリティグループを確認 |
| `terraform init` で backend のエラー | bootstrap 未実施、プロファイル未設定 | バケット名と `taskmanagement-prod` の設定を確認 |
