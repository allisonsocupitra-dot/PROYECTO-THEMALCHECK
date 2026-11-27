"""Prueba extra para src/core/security.py: SOLO create_access_token.
"""
from jose import jwt

from src.core.config import settings
from src.core.security import create_access_token


def test_create_access_token_genera_un_jwt_decodificable_con_el_dato_original():
    token = create_access_token({"sub": "laurithsofia2008@gmail.com"})

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

    assert payload["sub"] == "laurithsofia2008@gmail.com"
    assert "exp" in payload  # debe traer fecha de expiración