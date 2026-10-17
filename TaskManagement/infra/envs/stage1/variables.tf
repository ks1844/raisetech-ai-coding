variable "region" {
  type    = string
  default = "ap-northeast-1"
}

variable "profile" {
  type    = string
  default = "taskmanagement-prod"
}

variable "project_name" {
  type    = string
  default = "taskmanagement"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "allowed_cidr" {
  description = "アプリ(8080)とSSH(22)を許可する接続元。自分のIP/32を指定する"
  type        = string

  validation {
    condition     = var.allowed_cidr != "0.0.0.0/0"
    error_message = "全世界には開けられません。自分のIPアドレス(/32)を指定してください。"
  }
}

variable "ssh_public_key" {
  description = "EC2 にログインするための SSH 公開鍵（.pub の中身）"
  type        = string
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "db_name" {
  type    = string
  default = "taskmanagement"
}

variable "db_username" {
  type    = string
  default = "taskuser"
}

variable "java_package" {
  description = "EC2 にインストールする Java のパッケージ名（バックエンドの toolchain は Java 25）"
  type        = string
  default     = "java-25-amazon-corretto-headless"
}
