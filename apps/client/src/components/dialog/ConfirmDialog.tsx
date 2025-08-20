import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/joy';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

export default function ConfirmDialog({ open, onClose, onConfirm, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ bgcolor: 'background.body', color: 'text.primary', borderRadius: 6, boxShadow: 'lg' }}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>{message}</DialogContent>
        <DialogActions>
          <Button variant="plain" color="neutral" onClick={onClose}>Cancel</Button>
          <Button color="danger" variant="solid" onClick={onConfirm}>Delete</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
