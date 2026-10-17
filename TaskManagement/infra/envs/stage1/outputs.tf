output "ec2_public_ip" {
  value = aws_instance.app.public_ip
}

output "app_url" {
  value = "http://${aws_instance.app.public_ip}:8080"
}

output "rds_address" {
  value = aws_db_instance.main.address
}

output "rds_db_name" {
  value = aws_db_instance.main.db_name
}

output "rds_username" {
  value = aws_db_instance.main.username
}

output "rds_password" {
  value     = random_password.db.result
  sensitive = true
}

output "ssh_command" {
  value = "ssh -i <秘密鍵のパス> ec2-user@${aws_instance.app.public_ip}"
}
