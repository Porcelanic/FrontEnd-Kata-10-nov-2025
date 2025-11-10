output "s3_bucket_name" {
  description = "Nombre del bucket S3"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN del bucket S3"
  value       = aws_s3_bucket.website.arn
}

output "cloudfront_distribution_id" {
  description = "ID de la distribución de CloudFront"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "URL de CloudFront para acceder al sitio"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "website_url" {
  description = "URL completa del sitio web"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}
