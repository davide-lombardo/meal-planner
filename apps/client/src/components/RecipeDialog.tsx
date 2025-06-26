import * as React from 'react';
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, FormLabel, Input, Textarea, Typography } from '@mui/joy';
import type { Recipe } from './RecipeCard';

interface RecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

export default function RecipeDialog({ open, onClose, onSave, initialRecipe }: RecipeDialogProps) {
  const [nome, setNome] = React.useState(initialRecipe?.nome || '');
  const [ingredienti, setIngredienti] = React.useState(initialRecipe?.ingredienti?.join('\n') || '');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setNome(initialRecipe?.nome || '');
    setIngredienti(initialRecipe?.ingredienti?.join('\n') || '');
  }, [initialRecipe, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !ingredienti.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    onSave({ ...initialRecipe, nome, ingredienti: ingredienti.split(/\n|\r|\r\n/).map(i => i.trim()).filter(Boolean) } as Recipe);
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog aria-labelledby="edit-recipe-title" sx={{ bgcolor: 'background.body', color: 'text.primary', borderRadius: 6, boxShadow: 'lg' }}>
        <DialogTitle id="edit-recipe-title">{initialRecipe ? 'Edit Recipe' : 'Add New Recipe'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ minWidth: 350 }}>
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Nome Ricetta</FormLabel>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="e.g. Pasta alla carbonara" />
            </FormControl>
            <FormControl required>
              <FormLabel>Ingredienti (uno per riga)</FormLabel>
              <Textarea
                minRows={3}
                value={ingredienti}
                onChange={e => setIngredienti(e.target.value)}
                placeholder="pasta\nuova\nguanciale\n..."
              />
            </FormControl>
            {error && <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={onClose}>Cancel</Button>
            <Button type="submit" color="primary" variant="solid">{initialRecipe ? 'Save' : 'Add Recipe'}</Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}
