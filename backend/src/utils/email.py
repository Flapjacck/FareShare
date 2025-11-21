"""
Email verification utility module
"""
from typing import Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from itsdangerous import URLSafeTimedSerializer
from pydantic import EmailStr
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv

load_dotenv()

# Email Configuration
email_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", ""),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", ""),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@fareshare.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_FROM_NAME=os.getenv("MAIL_FROM_NAME", "FareShare"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    SUPPRESS_SEND=os.getenv("MAIL_SUPPRESS_SEND", "0").lower() in ("1", "true", "yes"),
    TEMPLATE_FOLDER=None
)

# Initialize FastMail
fastmail = FastMail(email_config)

# Initialize serializer with a secret key
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "your-password-salt-here")
serializer = URLSafeTimedSerializer(SECRET_KEY)

def generate_verification_token(email: str) -> str:
    """
    Generate a secure token for email verification
    """
    return serializer.dumps(email, salt=SECURITY_PASSWORD_SALT)

def verify_token(token: str, expiration: int = 3600) -> Optional[str]:
    """
    Verify the email verification token
    Args:
        token: The verification token
        expiration: Token expiration time in seconds (default: 1 hour)
    Returns:
        The email address if token is valid, None otherwise
    """
    try:
        email = serializer.loads(
            token,
            salt=SECURITY_PASSWORD_SALT,
            max_age=expiration
        )
        return email
    except Exception:
        return None

async def send_verification_email(email: EmailStr, verification_url: str):
    """
    Send verification email to user
    Args:
        email: The recipient's email address
        verification_url: The verification URL to include in the email
    Raises:
        HTTPException: If email sending fails
    """
    subject = "Please verify your email address"
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c3e50;">Welcome to FareShare!</h2>
                <p>Thank you for registering with FareShare. To complete your registration, please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" style="
                        background-color: #3498db;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 20px 0;
                    ">Verify Email Address</a>
                </p>
                <p>This link will expire in 1 hour for security purposes.</p>
                <p>If you did not register for FareShare, please ignore this email.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #7f8c8d; font-size: 12px;">
                    This is an automated message, please do not reply to this email.
                </p>
            </div>
        </body>
    </html>
    """
    
    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html_content,
        subtype="html"
    )
    
    try:
        await fastmail.send_message(message)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not send verification email"
        )
