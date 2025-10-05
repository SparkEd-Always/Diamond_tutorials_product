import { Box, Skeleton, Paper, Grid } from '@mui/material';

export const FormSkeleton = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} key={i}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Paper key={index} sx={{ p: 2, mb: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <Skeleton variant="text" width="80%" />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="text" width="60%" />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={3}>
              <Skeleton variant="text" width="50%" />
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export const CardSkeleton = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </Grid>
        <Grid item xs={6}>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </Grid>
      </Grid>
    </Paper>
  );
};

export const DashboardSkeleton = () => {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={40} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <TableSkeleton rows={8} />
    </Box>
  );
};

export const DetailsSkeleton = () => {
  return (
    <Box>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} key={i}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="20%" sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </Grid>
                <Grid item xs={6}>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="80%" />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
