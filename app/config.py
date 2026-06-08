import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # База данни
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'mysql+pymysql://root:root@localhost/greenestate')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'change-me-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Имейл
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_USERNAME', '')