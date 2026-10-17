data "aws_ssm_parameter" "al2023_ami" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}

resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-key"
  public_key = var.ssh_public_key
}

resource "aws_instance" "app" {
  ami                         = data.aws_ssm_parameter.al2023_ami.value
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  key_name                    = aws_key_pair.main.key_name
  associate_public_ip_address = true

  metadata_options {
    http_tokens = "required"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = <<-EOF
    #!/bin/bash
    set -euxo pipefail

    # Java 25（toolchain と同じ版）。パッケージが無い場合は Corretto の tar.gz を直接配置する
    if ! dnf install -y ${var.java_package}; then
      curl -fsSL https://corretto.aws/downloads/latest/amazon-corretto-25-x64-linux-jdk.tar.gz -o /tmp/corretto.tar.gz
      mkdir -p /opt/corretto
      tar -xzf /tmp/corretto.tar.gz -C /opt/corretto --strip-components=1
      ln -sf /opt/corretto/bin/java /usr/local/bin/java
    fi

    # ローカル開発（docker-compose の postgres:17）と同じメジャーバージョン
    dnf install -y postgresql17-server

    postgresql-setup --initdb
    sed -i 's/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
    systemctl enable --now postgresql

    mkdir -p /opt/app
    chown ec2-user:ec2-user /opt/app
  EOF

  # 最新AMIが更新されても、稼働中のEC2を作り直さない
  lifecycle {
    ignore_changes = [ami]
  }

  tags = {
    Name = "${var.project_name}-app"
  }
}
