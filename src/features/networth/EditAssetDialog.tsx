import { Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { t } from '@/i18n';
import { ASSET_CATEGORIES } from '@/lib/validation/networth';
import { useNetworthStore } from '@/stores/networthStore';
import type { Asset, AssetCategory } from '@/types/domain';

import { categoryLabel } from './labels';

/** Dialogo para editar nombre y categoria de un activo. */
export function EditAssetDialog({ asset }: { asset: Asset }) {
  const updateAsset = useNetworthStore((s) => s.updateAsset);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(asset.name);
  const [category, setCategory] = useState<AssetCategory>(asset.category);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (name.trim() === '') return;
    setBusy(true);
    try {
      await updateAsset(asset.id, { name: name.trim(), category });
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(asset.name);
          setCategory(asset.category);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label={`${t('networth.edit')}: ${asset.name}`}
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('networth.editAsset')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void submit(e)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-asset-name">{t('networth.form.name')}</Label>
            <Input
              id="edit-asset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-asset-category">
              {t('networth.form.category')}
            </Label>
            <Select
              id="edit-asset-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as AssetCategory)}
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('networth.form.cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {t('networth.form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
