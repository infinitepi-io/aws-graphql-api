# Security Policy

## Supported Versions

Only the latest version of the AWS GraphQL API is actively maintained and receives security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

- 🔒 AWS IAM Authentication
- 🔐 Non-root Docker container execution
- 🛡️ Input validation through GraphQL schema
- 📦 Dependencies regularly updated and monitored
- 🔍 Automated security scanning in CI/CD

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please bring it to our attention right away:

1. **DO NOT** open a public GitHub issue.
2. Submit your report privately via email to [SECURITY CONTACT EMAIL]
3. Include detailed steps to reproduce the vulnerability
4. Expect an initial response within 48 hours

## Security Best Practices

When deploying this API:

1. **AWS IAM**
   - Use the principle of least privilege
   - Regularly rotate AWS credentials
   - Use IAM roles instead of access keys when possible

2. **Docker Security**
   - Keep base images updated
   - Never run containers as root
   - Use Docker content trust

3. **API Security**
   - Enable AWS CloudTrail logging
   - Monitor API usage with CloudWatch
   - Implement rate limiting at the API Gateway level

## Dependencies

We use `pnpm` with lockfiles to ensure dependency consistency and security:
- Dependencies are automatically updated via Dependabot
- Security advisories are monitored
- Vulnerability patches are applied promptly

## Disclosure Policy

- Security issues will be patched as quickly as possible
- Updates will be released as patch versions
- Users will be notified through GitHub releases
- Critical vulnerabilities will be communicated directly to users who have starred/watched the repository
