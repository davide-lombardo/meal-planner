import * as React from 'react';
import { Snackbar, Typography } from '@mui/joy';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Notification() {
  const { notification, clearNotification } = useAppContext();
  
  const icon = React.useMemo(() => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  }, [notification.type]);
  
  const color = React.useMemo(() => {
    switch (notification.type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      default:
        return 'primary';
    }
  }, [notification.type]);

  return (
    <Snackbar
      variant="soft"
      color={color}
      open={notification.visible}
      onClose={clearNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      startDecorator={icon}
      endDecorator={
        <Typography
          component="button"
          fontSize="sm"
          fontWeight="lg"
          sx={{ cursor: 'pointer' }}
          onClick={clearNotification}
        >
          Dismiss
        </Typography>
      }
    >
      {notification.message}
    </Snackbar>
  );
}
