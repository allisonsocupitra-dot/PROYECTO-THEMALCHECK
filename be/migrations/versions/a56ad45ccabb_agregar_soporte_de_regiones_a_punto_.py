"""agregar color a punto_medicion y observaciones a imagen_termografica

Revision ID: c3f1a9d27e10
Revises: a56ad45ccabb
Create Date: 2026-11-17 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c3f1a9d27e10'
down_revision: Union[str, Sequence[str], None] = 'a56ad45ccabb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('punto_medicion', sa.Column('color', sa.String(length=20), nullable=True))
    op.add_column('imagen_termografica', sa.Column('observaciones', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('imagen_termografica', 'observaciones')
    op.drop_column('punto_medicion', 'color')