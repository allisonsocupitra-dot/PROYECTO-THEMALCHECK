import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.core.config import settings

def enviar_correo_recuperacion(destinatario: str):
    enlace = f"{settings.FRONTEND_URL}/restablecer-contrasena?correo={destinatario}"

    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Recuperación de contraseña - ThermalCheck"
    mensaje["From"] = settings.SMTP_USER
    mensaje["To"] = destinatario

    cuerpo_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color:#1a1a2e;">ThermalCheck</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="{enlace}" style="display:inline-block;padding:10px 20px;background:#1a1a2e;color:#fff;text-decoration:none;border-radius:6px;">
            Restablecer contraseña
        </a>
        <p style="margin-top:20px;font-size:12px;color:#666;">
            Si no solicitaste esto, puedes ignorar este correo.
        </p>
    </div>
    """

    mensaje.attach(MIMEText(cuerpo_html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, destinatario, mensaje.as_string())