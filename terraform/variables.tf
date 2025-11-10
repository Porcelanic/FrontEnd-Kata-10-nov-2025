variable "aws_region" {
  description = "Región de AWS donde se desplegarán los recursos"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "frontend-kata"
}

variable "environment" {
  description = "Ambiente de despliegue"
  type        = string
  default     = "production"
}

variable "bucket_name" {
  description = "Nombre del bucket S3 (debe ser único globalmente)"
  type        = string
  default     = "frontend-kata-nextjs-app"
}

variable "cloudfront_price_class" {
  description = "Clase de precio de CloudFront"
  type        = string
  default     = "PriceClass_100" 
}


