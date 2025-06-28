import * as React from 'react';
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, FormLabel, Input, Textarea, Typography, Select, Option } from '@mui/joy';
import type { Recipe, Category, RecipeType } from './RecipeCard';

interface RecipeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
  initialRecipe?: Recipe | null;
}

export default function RecipeDialog({ open, onClose, onSave, initialRecipe }: RecipeDialogProps) {
  const [nome, setNome] = React.useState(initialRecipe?.nome || '');
  const [ingredienti, setIngredienti] = React.useState(initialRecipe?.ingredienti?.join('\n') || '');
  const [categoria, setCategoria] = React.useState<Category | ''>(initialRecipe?.categoria || '');
  const [tipo, setTipo] = React.useState<RecipeType | ''>(initialRecipe?.tipo || '');
  const [link, setLink] = React.useState(initialRecipe?.link || '');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setNome(initialRecipe?.nome || '');
    setIngredienti(initialRecipe?.ingredienti?.join('\n') || '');
    setCategoria(initialRecipe?.categoria || '');
    setTipo(initialRecipe?.tipo || '');
    setLink(initialRecipe?.link || '');
  }, [initialRecipe, open]);

  const validCategories: Category[] = ['pesce', 'carne', 'formaggio', 'uova'];
  const validTypes: RecipeType[] = ['pranzo', 'cena'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !ingredienti.trim() || !categoria || !tipo) {
      setError('Please fill in all fields.');
      return;
    }
    if (!validCategories.includes(categoria as Category)) {
      setError('Categoria non valida.');
      return;
    }
    if (!validTypes.includes(tipo as RecipeType)) {
      setError('Tipo non valido.');
      return;
    }
    const recipeToSave: Recipe = {
      id: initialRecipe?.id || '',
      nome,
      categoria: categoria as Category,
      tipo: tipo as RecipeType,
      ingredienti: ingredienti.split(/\n|\r|\r\n/).map(i => i.trim()).filter(Boolean),
      link: link.trim() || undefined,
    };
    onSave(recipeToSave);
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog 
        aria-labelledby="edit-recipe-title" 
        sx={{ 
          bgcolor: 'background.body', 
          color: 'text.primary', 
          borderRadius: 6, 
          boxShadow: 'lg',
          // Fix horizontal overflow
          width: '100%',
          maxWidth: { xs: '95vw', sm: '500px' },
          // Fix vertical overflow
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <DialogTitle id="edit-recipe-title">
          {initialRecipe ? 'Edit Recipe' : 'Add New Recipe'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <DialogContent sx={{ 
            flex: 1,
            overflow: 'auto',
            // Ensure content doesn't break out horizontally
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Nome Ricetta</FormLabel>
              <Input 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="e.g. Pasta alla carbonara"
                sx={{ width: '100%' }}
              />
            </FormControl>
            
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Categoria</FormLabel>
              <Select 
                value={categoria} 
                onChange={(_, v) => setCategoria((v as Category) || '')} 
                placeholder="Seleziona categoria"
                sx={{ width: '100%' }}
              >
                {validCategories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Tipo</FormLabel>
              <Select 
                value={tipo} 
                onChange={(_, v) => setTipo((v as RecipeType) || '')} 
                placeholder="Seleziona tipo"
                sx={{ width: '100%' }}
              >
                {validTypes.map(t => (
                  <Option key={t} value={t}>{t}</Option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl required sx={{ mb: 2 }}>
              <FormLabel>Ingredienti (uno per riga)</FormLabel>
              <Textarea
                minRows={3}
                maxRows={6}
                value={ingredienti}
                onChange={e => setIngredienti(e.target.value)}
                placeholder="pasta\nuova\nguanciale\n..."
                sx={{ width: '100%', resize: 'none' }}
              />
            </FormControl>
            
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Link alla ricetta (opzionale)</FormLabel>
              <Input
                value={link}
                onChange={e => setLink(e.target.value)}
                placeholder="https://esempio.com/ricetta"
                type="url"
                sx={{ width: '100%' }}
              />
            </FormControl>
            
            {error && (
              <Typography color="danger" level="body-sm" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            flexShrink: 0,
            pt: 2,
            gap: 1
          }}>
            <Button variant="plain" color="neutral" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="solid">
              {initialRecipe ? 'Save' : 'Add Recipe'}
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}