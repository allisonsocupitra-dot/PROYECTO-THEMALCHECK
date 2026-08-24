from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ThermalCheck API"
    SECRET_KEY: str = "TU_CLAVE_SECRETA_SUPER_SEGURA_CAMBIAME_EN_PRODUCCION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_HOST: str = "127.0.0.1"
    DB_PORT: str = "3355"
    DB_NAME: str = "themalcheck"

    DATABASE_URL: str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    class Config:
        env_file = ".env"

settings = Settings()