# 🔐 Security Policy

## 📌 Supported Versions

The following versions of **Explain My Workflow** are currently supported with security updates:

| Version | Supported |
|----------|------------|
| Latest   | ✅ Yes |
| Older Versions | ❌ No |

We recommend always using the latest version of the project to ensure maximum security and stability.

---

## 🚨 Reporting a Vulnerability

The security of this project is very important to us.

If you discover a security vulnerability, please follow the steps below:

### 🔒 Please Do NOT:
- Open a public GitHub issue
- Disclose the vulnerability publicly
- Share exploit details in discussion threads

### ✅ Instead:
1. Email the maintainers directly (add your email here)
2. Provide a detailed description of the vulnerability
3. Include steps to reproduce the issue
4. Share any proof-of-concept code (if applicable)
5. Mention the potential impact

We will acknowledge your report within **48 hours**.

---

## ⏱ Response Timeline

- Acknowledgement: Within 48 hours
- Initial Assessment: Within 3–5 business days
- Patch Release (if confirmed): As soon as possible

We are committed to resolving valid security issues promptly.

---

## 🔎 Scope of Security Concerns

This project processes workflow JSON files. Security considerations include:

- Malicious JSON payloads
- Injection attempts
- Unsafe file uploads
- API key exposure
- Unauthorized access (if deployed publicly)
- Dependency vulnerabilities

We strongly recommend:

- Validating all input JSON
- Sanitizing user input
- Protecting API keys using environment variables
- Keeping dependencies up to date

---

## 🛡 Best Security Practices

If you are deploying this project:

- Use HTTPS in production
- Store secrets in `.env` files (never commit them)
- Use secure API key management
- Enable rate limiting (if API-based)
- Regularly update dependencies
- Monitor logs for suspicious activity

---

## 📦 Dependency Security

We recommend running:

```bash
npm audit
```

And updating vulnerable packages:

```bash
npm update
```

You may also use tools like:

- GitHub Dependabot
- Snyk
- npm audit fix

---

## 🤝 Responsible Disclosure

We appreciate responsible disclosure and security research efforts.

If you report a valid security vulnerability:

- You will be credited (if desired)
- We will work with you to fix the issue
- We will notify users if necessary

---

## ⚠ Disclaimer

This project is provided "as is" without warranty of any kind.

Users deploying this tool in production environments are responsible for implementing appropriate security controls.

---

## ❤️ Thank You

Security is a shared responsibility. Thank you for helping make **Explain My Workflow** safer for everyone.
