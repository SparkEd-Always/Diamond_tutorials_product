"""add student fields for fee sessions

Revision ID: add_student_fields
Revises:
Create Date: 2025-10-18

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_student_fields'
down_revision = None
depends_on = None

def upgrade():
    # Add missing fields to students table
    with op.batch_alter_table('students') as batch_op:
        batch_op.add_column(sa.Column('first_name', sa.String(100), nullable=True))
        batch_op.add_column(sa.Column('last_name', sa.String(100), nullable=True))
        batch_op.add_column(sa.Column('current_class_id', sa.Integer, sa.ForeignKey('classes.id'), nullable=True))
        batch_op.add_column(sa.Column('roll_number', sa.String(20), nullable=True))
        batch_op.add_column(sa.Column('is_active', sa.Boolean, default=True, nullable=True))

def downgrade():
    with op.batch_alter_table('students') as batch_op:
        batch_op.drop_column('is_active')
        batch_op.drop_column('roll_number')
        batch_op.drop_column('current_class_id')
        batch_op.drop_column('last_name')
        batch_op.drop_column('first_name')
