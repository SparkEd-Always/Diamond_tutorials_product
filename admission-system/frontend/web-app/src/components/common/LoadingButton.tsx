import { Button, CircularProgress, Box } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = ({
  loading = false,
  loadingText,
  children,
  disabled,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <CircularProgress size={20} color="inherit" />
          {loadingText && <span>{loadingText}</span>}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
