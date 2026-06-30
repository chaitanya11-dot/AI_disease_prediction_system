"""
utils/email_utils.py - Sends emails via SMTP if configured, otherwise prints to console.

This keeps the app fully functional offline / without any paid API: if MAIL_SERVER
is not configured in the environment, "sending" an email simply logs its content to
the backend console (and returns success), so the rest of the app (password reset,
prediction report emailing) still works end-to-end during local development.
"""
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from flask import current_app


def _is_smtp_configured():
    cfg = current_app.config
    return bool(cfg.get("MAIL_SERVER") and cfg.get("MAIL_USERNAME") and cfg.get("MAIL_PASSWORD"))


def send_email(to_email: str, subject: str, body: str, attachment_bytes: bytes = None, attachment_filename: str = None):
    """
    Sends a plain-text email. If SMTP isn't configured, logs to console instead
    (console mode) so the feature still "works" in a fully offline local setup.
    Returns True on success (or console-mode "success"), False on real failure.
    """
    if not _is_smtp_configured():
        print("\n" + "=" * 60)
        print("[CONSOLE-MODE EMAIL] (no SMTP configured, printing instead)")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print("-" * 60)
        print(body)
        if attachment_filename:
            print(f"[Attachment would be included: {attachment_filename}]")
        print("=" * 60 + "\n")
        return True

    try:
        cfg = current_app.config
        msg = MIMEMultipart()
        msg["From"] = cfg["MAIL_DEFAULT_SENDER"]
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        if attachment_bytes and attachment_filename:
            part = MIMEApplication(attachment_bytes, Name=attachment_filename)
            part["Content-Disposition"] = f'attachment; filename="{attachment_filename}"'
            msg.attach(part)

        context = ssl.create_default_context()
        with smtplib.SMTP(cfg["MAIL_SERVER"], cfg["MAIL_PORT"]) as server:
            if cfg["MAIL_USE_TLS"]:
                server.starttls(context=context)
            server.login(cfg["MAIL_USERNAME"], cfg["MAIL_PASSWORD"])
            server.sendmail(cfg["MAIL_DEFAULT_SENDER"], to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email to {to_email}: {e}")
        return False
