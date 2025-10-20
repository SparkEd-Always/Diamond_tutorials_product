"""Add FeeStructureComponent model

Revision ID: fee_structure_components
Revises:
Create Date: 2025-10-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fee_structure_components'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create new fee_structure_components table
    op.create_table(
        'fee_structure_components',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('fee_structure_id', sa.Integer(), nullable=False),
        sa.Column('fee_type_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('display_order', sa.Integer(), server_default='0'),
        sa.Column('is_mandatory', sa.Boolean(), server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['fee_structure_id'], ['fee_structures.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['fee_type_id'], ['fee_types.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_fee_structure_components_fee_structure_id', 'fee_structure_components', ['fee_structure_id'])
    op.create_index('ix_fee_structure_components_fee_type_id', 'fee_structure_components', ['fee_type_id'])

    # Modify fee_structures table
    # NOTE: SQLite doesn't support ALTER COLUMN directly, so we need to:
    # 1. Create a new table with the new schema
    # 2. Copy data
    # 3. Drop old table
    # 4. Rename new table

    # For simplicity in development, we'll drop and recreate
    # In production, you'd want to preserve data

    # WARNING: This will delete all existing fee structure data!
    # op.drop_table('fee_structures')

    # For now, just add new columns if they don't exist
    # In SQLite, we can't drop columns easily, so old columns will remain
    try:
        op.add_column('fee_structures', sa.Column('structure_name', sa.String(length=200), nullable=True))
        op.add_column('fee_structures', sa.Column('description', sa.Text(), nullable=True))
    except:
        pass  # Columns may already exist


def downgrade():
    # Remove added columns
    try:
        op.drop_column('fee_structures', 'description')
        op.drop_column('fee_structures', 'structure_name')
    except:
        pass

    # Drop fee_structure_components table
    op.drop_index('ix_fee_structure_components_fee_type_id')
    op.drop_index('ix_fee_structure_components_fee_structure_id')
    op.drop_table('fee_structure_components')
