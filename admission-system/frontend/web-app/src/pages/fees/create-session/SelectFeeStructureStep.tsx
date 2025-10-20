import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import type { FeeStructure, GroupedFeeStructure } from '../../../types/fees';

interface SelectFeeStructureStepProps {
  feeStructures: FeeStructure[];
  selectedStructureId: number;
  onSelect: (structure: FeeStructure) => void;
}

const SelectFeeStructureStep: React.FC<SelectFeeStructureStepProps> = ({
  feeStructures,
  selectedStructureId,
  onSelect,
}) => {
  const [groupedStructures, setGroupedStructures] = useState<GroupedFeeStructure[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupedFeeStructure | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);

  // Group structures by class and academic year
  useEffect(() => {
    groupFeeStructures();
  }, [feeStructures]);

  const groupFeeStructures = () => {
    const grouped = new Map<string, FeeStructure[]>();

    feeStructures.forEach(structure => {
      const key = `${structure.class_id}-${structure.academic_year_id}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(structure);
    });

    const result: GroupedFeeStructure[] = [];
    grouped.forEach((structureList, key) => {
      const [classId, yearId] = key.split('-').map(Number);
      const firstStructure = structureList[0];

      // Use the class_name and academic_year_name from the first structure
      const className = firstStructure.class_name || `Class #${classId}`;
      const yearName = firstStructure.academic_year_name || `${yearId}`;

      const totalAmount = structureList.reduce((sum, s) => sum + Number(s.amount), 0);

      result.push({
        id: key,
        name: `${className} - ${yearName}`,
        classId,
        className,
        academicYearId: yearId,
        academicYearName: yearName,
        totalAmount,
        feeTypeCount: structureList.length,
        structures: structureList,
      });
    });

    // Sort by class name
    result.sort((a, b) => a.className.localeCompare(b.className));
    setGroupedStructures(result);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCardClick = (group: GroupedFeeStructure) => {
    setSelectedGroup(group);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDetailDialog(false);
  };

  const handleSelectGroup = (group: GroupedFeeStructure) => {
    // When selecting a group, we need to pass back a single structure ID
    // For now, we'll select the first structure in the group
    // The parent component will need to handle multiple structures if needed
    if (group.structures.length > 0) {
      onSelect(group.structures[0]);
    }
    setOpenDetailDialog(false);
  };

  const isGroupSelected = (group: GroupedFeeStructure) => {
    return group.structures.some(s => s.id === selectedStructureId);
  };

  const getSelectedGroup = () => {
    return groupedStructures.find(g => isGroupSelected(g)) || null;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="medium">
        Select Fee Structure
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose the class and academic year combination for this fee session
      </Typography>

      {feeStructures.length === 0 ? (
        <Alert severity="warning" sx={{ mt: 3 }}>
          No active fee structures found. Please create a fee structure first.
        </Alert>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {groupedStructures.map((group) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={group.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: isGroupSelected(group) ? 2 : 0,
                  borderColor: isGroupSelected(group) ? 'primary.main' : 'transparent',
                  bgcolor: isGroupSelected(group) ? 'action.selected' : 'background.paper',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardActionArea onClick={() => handleCardClick(group)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Class + Academic Year Name */}
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {group.name}
                    </Typography>

                    {/* Total Amount - Large & Bold */}
                    <Typography
                      variant="h5"
                      color="primary.main"
                      fontWeight={700}
                      sx={{ mb: 1 }}
                    >
                      {formatCurrency(group.totalAmount)}
                    </Typography>

                    {/* Fee Type Count */}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {group.feeTypeCount} fee type{group.feeTypeCount !== 1 ? 's' : ''}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Selected Structure Confirmation */}
      {getSelectedGroup() && (
        <Paper sx={{ mt: 3, p: 3, bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckIcon color="success" />
            <Typography variant="h6" color="success.main">
              Fee Structure Selected
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            <strong>{getSelectedGroup()?.name}</strong> - Total: {formatCurrency(getSelectedGroup()?.totalAmount || 0)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            You can proceed to select students for this fee structure
          </Typography>
        </Paper>
      )}

      {/* Detail Dialog - Shows breakdown of fee types */}
      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6">{selectedGroup?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Fee Structure Breakdown
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight={700}>
              {selectedGroup && formatCurrency(selectedGroup.totalAmount)}
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
            Included Fee Types:
          </Typography>
          <List dense>
            {selectedGroup?.structures.map((structure, index) => (
              <React.Fragment key={structure.id}>
                {index > 0 && <Divider />}
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={structure.fee_type_name || `Fee Type #${structure.fee_type_id}`}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={formatCurrency(structure.amount)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {structure.installments > 1 && (
                          <Chip
                            label={`${structure.installments} installments`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={() => selectedGroup && handleSelectGroup(selectedGroup)}
            variant="contained"
            color="primary"
          >
            Select This Structure
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SelectFeeStructureStep;
