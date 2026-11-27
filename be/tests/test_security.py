"""Pruebas unitarias de las funciones de hash de contraseña (src/core/security.py).

No requieren base de datos: son funciones puras.
"""
from src.core.security import hash_password, verify_password


def test_hash_password_genera_un_hash_distinto_al_texto_plano():
    plano = "ClaveSegura123"
    hashed = hash_password(plano)
    assert hashed != plano
    assert len(hashed) > 0


def test_verify_password_acepta_la_contrasena_correcta():
    plano = "ClaveSegura123"
    hashed = hash_password(plano)
    assert verify_password(plano, hashed) is True


def test_verify_password_rechaza_la_contrasena_incorrecta():
    hashed = hash_password("ClaveSegura123")
    assert verify_password("otra-clave", hashed) is False